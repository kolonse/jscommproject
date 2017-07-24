var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var cors = require('cors');
var ErrorCode = require("./Common/ErrorCode");
var Config = require("./config/config.js");
var config = require("./Helper/ConfigLoader/ConfigLoader.js")(Config);
var DB = require("./Helper/DBHelper");
var DBManger = require("./Helper/DBManager/DBManager");
var dbinst = DBManger(config.get("db"));
var Promise = require("promise");
var logger = require('./logger.js');
var version = require("./Common/version.json");
var CommonFunction = require("./Common/CommonFunction.js");
var Common = require("./Common/Common.js");
var Console = require("./Common/Console.js");
var fs = require("fs");
var WXParse = require("wx-pay").wxParse;
var WXSig = require("wx-pay").wxSig;
var RedisConfig = config.get("RedisConfig");
var redisdb = require("./Helper/Redis/Redis.js")(RedisConfig);
var Redlock = require("redlock");
var clients = [];
var redis = require("redis");
if (!RedisConfig.ClusterConfig) {
    var client = null;
    if (RedisConfig.password) {
        client = redis.createClient(RedisConfig.port, RedisConfig.host, { password: RedisConfig.password });
    } else {
        client = redis.createClient(RedisConfig.port, RedisConfig.host);
    }
    clients.push(client);
} else {
    for (var i = 0; i < RedisConfig.ClusterConfig.length; i++) {
        var rcfg = RedisConfig.ClusterConfig[i];
        var rclient = null;
        if (RedisConfig.password) {
            rclient = redis.createClient(rcfg.port, rcfg.host, { password: RedisConfig.password });
        } else {
            rclient = redis.createClient(rcfg.port, rcfg.host);
        }
        clients.push(rclient);
    }
}

var redlock = new Redlock(clients, {
    // the expected clock drift; for more details
    // see http://redis.io/topics/distlock
    driftFactor: 0.01, // time in ms

    // the max number of times Redlock will attempt
    // to lock a resource before erroring
    retryCount: 10,

    // the time in ms between attempts
    retryDelay: 400, // time in ms

    // the max time in ms randomly added to retries
    // to improve performance under high contention
    // see https://www.awsarchitectureblog.com/2015/03/backoff.html
    retryJitter: 400 // time in ms
});

function Server(opt) {
    opt = opt || {};
    this.port = opt.port || 13002;
    this.logger = opt.logger || {
        error: console.error,
        warn: console.log,
        info: console.log,
        debug: console.log
    };
    this.dbhelper = opt.dbhelper;
    this.config = opt.config;
    this.version = opt.version;
    this.apps = opt.apps;
    this.app = express();
    this.init();
}

var pt = Server.prototype;
pt.init = function() {
    var self = this;
    this.app.logger = this.logger;
    this.app.dbhelper = this.dbhelper;
    this.app.config = this.config;
    this.app.version = this.version;
    this.app.CommonFunction = CommonFunction;
    this.app.Common = Common;
    this.app.ErrorCode = ErrorCode;
    this.app.redis = redisdb;
    this.app.redlock = redlock;
    this.app.apps = this.apps;
    this.app.Console = Console;
    this.app.wxParse = WXParse({
        // wxpaykey: this.mch_key,
        parseFlag: function(req) {
            if (/\/api\/notify/.test(req.path)) {
                return true;
            }
            return false;
        }
    });
    this.app.wxSig = WXSig({ wxpaykey: this.mch_key });
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(this.app.wxParse.MiddleWare());
    this.app.use(multer());
    this.app.set('view engine', 'html');
    this.app.set('views', __dirname + '/views'); //配置视图
    this.app.engine('.html', require('ejs').__express);
    this.app.use(express.static(__dirname + '/public'));
    this.app.use(express.static(__dirname + '/views'));
    this.app.use(function(req, res, next) {
        self.app.logger.debug("%s %s", req.method, req.path);
        next();
    });

    function walkDir(dir) {
        fs.readdirSync(dir).forEach(function(filename) {
            var stat = fs.lstatSync(dir + filename);
            if (stat.isDirectory()) {
                walkDir(dir + filename + "/");
                return;
            }
            if (/\.js$/.test(filename)) {
                require(dir + filename)(self.app);
            }
        });
    }
    walkDir(__dirname + '/routes/');
    this.app.use(function(err, req, res, next) {
        var param = req.method === "GET" ? req.query : req.body;
        self.logger.error("%s %j 处理异常,err:", req.path, param, err.stack);
        if (req.path === "/do") {
            res.render("error.html");
            return;
        } else if (req.path === "/api/notify") {
            res.wxpayxml({
                return_code: "FAIL",
                return_msg: "服务异常"
            });
            return;
        }
        res.json({
            code: -1,
            message: "服务异常"
        });
    });
    this.app.listen(this.port);
    this.logger.info("支付服务启动完成,启动端口:%s 版本:%s 构建号:%s", this.port, this.version.VERSION, this.version.BUILD_ID);
};

function getIPAdress() {
    var interfaces = require('os').networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
}

dbinst.pay.sync()
    .then(function() {
        return dbinst.shopinfo.sync();
    })
    .then(function() {
        return dbinst.app.sync();
    })
    .then(function() {
        // 加载所有商品
        return dbinst.shopinfo.findAll()
            .then(function(datas) {
                if (!datas || datas.length === 0) {
                    return new Promise(function(fulfill, reject) { reject(new Error("商品信息数据为空")); });
                }
                var shopinfo = {};
                for (var i = 0; i < datas.length; i++) {
                    shopinfo[datas[i].dataValues.id] = datas[i].dataValues;
                }
                config.update("shopinfo", shopinfo);
                return new Promise(function(fulfill) { fulfill(); });
            });
    })
    .then(function() {
        return dbinst.app.findAll()
            .then(function(datas) {
                var apps = {};
                for (var i = 0; i < datas.length; i++) {
                    apps[datas[i].dataValues.id] = datas[i].dataValues;
                }
                config.update("apps", apps);
                return new Promise(function(fulfill) { fulfill(); });
            });
    })
    .then(function(key) {
        var db = new DB({
            db: dbinst
        });
        var server = new Server({
            logger: logger,
            dbhelper: db,
            config: config,
            version: version,
            mch_key: key,
            isSandbox: key ? true : false,
            apps: config.get("apps")
        });
    })
    .catch(function(err) {
        logger.error("服务器启动失败 err:", err.stack);
    });


var testPlat = config.get("TestPlat");
if (testPlat) {
    var WXTestPlat = require("./Helper/WXTestPlat");
    var wxTestPlat = new WXTestPlat({
        logger: logger,
        config: config,
        wxParse: WXParse({}),
        wxSig: WXSig({}),
        apps: config.get("apps")
    });
}