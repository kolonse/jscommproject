process.chdir(__dirname);
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var cors = require('cors');
var logger = require('./logger.js');
var DB = require("./Helper/DBHelper");
var DBManger = require("./Helper/DBManager/DBManager");
var Config = require("./config/config.js");
var config = require("./Helper/ConfigLoader/ConfigLoader.js")(Config);
var dbinst = DBManger(config.get("db"));
var ErrorCode = require("./Common/ErrorCode.js");
var CommonFunction = require("./Common/CommonFunction.js");
var Common = require("./Common/Common.js");
var session = require('express-session');
var cookieParser = require('cookie-parser');
var fs = require("fs");
var Promise = require("promise");
var DBLogClient = require("./Helper/MsgSenderClient/MsgSenderClient.js");
var dblogclient = DBLogClient({
    logger: logger,
    uri: config.get("amq")
});
var ccap = require("ccap")();
var auth = require("./Helper/Authority");

function Server(opt) {
    opt = opt || {};
    this.port = opt.port || 16001;
    this.logger = opt.logger || {
        error: console.error,
        warn: console.log,
        info: console.log,
        debug: console.log
    };
    this.dbhelper = opt.dbhelper;
    this.app = express();
    this.init();
}

var pt = Server.prototype;
pt.init = function() {
    var self = this;
    this.app.config = config;
    this.app.logger = this.logger;
    this.app.dbhelper = this.dbhelper;
    this.app.ErrorCode = ErrorCode;
    this.app.CommonFunction = CommonFunction;
    this.app.Common = Common;
    this.app.dblogclient = dblogclient;
    this.app.use(session({
        name: "fcadmin",
        secret: 'fcadmin20170217',
        resave: true,
        saveUninitialized: false,
        cookie: {
            secure: true,
            maxAge: 1 * 24 * 3600 * 1000
        }
    }));
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(multer());
    this.app.get("/index.html", function(req, res) {
        res.redirect("systemmanager/systemsetting.html");
    });
    this.app.get("/readConfigCache", function(req, res) {
        fs.readFile(__dirname + "/cache/config_cache.json", function(err, data) {
            if (err) {
                res.end(data);
                return;
            }
            res.end(data);
        });
    });
    this.app.get("/getPassCode", function(req, res) {
        var rand = req.query.rand;
        if (rand === undefined) {
            res.status(400).send('Bad Request');
            return;
        }
        var ary = ccap.get();
        var text = ary[0];
        var buffer = ary[1];
        self.app.dbhelper.writeToken(rand, text, 60 * 1000, function(err) {
            if (err) {
                self.logger.error("err:", err);
                res.status(400).send('Bad Request');
                return;
            }
            res.end(buffer);
        });
    });
    this.app.get("/", function(req, res) {
        res.redirect("login.html");
    });
    this.app.get("/*", cookieParser('fcadmin20170217'));
    this.app.get("/*", function(req, res, next) {
        //res.redirect("login.html");
        if (/login\.html/.test(req.path)) {
            next();
            return;
        }
        if (!/\.html/.test(req.path)) {
            next();
            return;
        }
        if (req.cookies) {
            var token = req.cookies.fcadmin;
            self.dbhelper.readToken(token, function(err, data) {
                if (err) {
                    self.logger.error("%s 读取 token 数据异常,err:", req.path, err.stack);
                    res.redirect("/login.html");
                    return;
                }
                if (data) {
                    self.dbhelper.writeToken(token, data.v, function() {});
                    req.fcadmin = data.v;
                    next();
                    return;
                }
                res.redirect("/login.html");
            });
        } else {
            res.redirect("/login.html");
        }
    });
    this.app.use(express.static(__dirname + '/public'));
    this.app.use(express.static(__dirname + '/views'));
    // this.app.get("/*",cookieParser('fcadmin20170217'));    
    this.app.post("/*", cookieParser('fcadmin20170217'));
    this.app.post("/*", function(req, res, next) {
        var currentGameAppId = self.app.config.get("currentGameAppId");
        if (!req.body) {
            req.body = {};
        }
        if (!req.body.currentGameAppId) {
            req.body.currentGameAppId = currentGameAppId;
        }
        currentGameAppId = req.body.currentGameAppId;
        if (self.app.config.get("gameappList")[currentGameAppId]) {
            var currentGameAppUrl = self.app.config.get("gameappList")[currentGameAppId].callbackUrl;
            req.body.currentGameAppUrl = currentGameAppUrl;
        }
        next();
    });
    // 校验是否登录
    this.app.post("/getData/*", function(req, res, next) {
        if (req.cookies) {
            var token = req.cookies.fcadmin;
            self.dbhelper.readToken(token, function(err, data) {
                if (err) {
                    self.logger.error("%s 读取 token 数据异常,err:", req.path, err.stack);
                    res.json({
                        draw: parseInt(req.body.draw),
                        error: err.message
                    });
                    return;
                }
                if (data) {
                    self.dbhelper.writeToken(token, data.v, function() {});
                    req.fcadmin = data.v;
                    next();
                    return;
                }
                res.json({
                    draw: parseInt(req.body.draw),
                    error: "未登录,需要刷新重新登录"
                });
            });
        } else {
            res.json({
                draw: parseInt(req.body.draw),
                error: "页面被重置,需要重新登录"
            });
        }
    });
    this.app.post("/submitData/*", function(req, res, next) {
        if (req.cookies) {
            var token = req.cookies.fcadmin;

            self.dbhelper.readToken(token, function(err, data) {
                if (err) {
                    res.json({
                        code: ErrorCode.errorRead,
                        message: err.message
                    });
                    return;
                }
                if (data) {
                    self.dbhelper.writeToken(token, data.v, function() {});
                    req.fcadmin = data.v;
                    next();
                    return;
                }
                res.json({
                    code: ErrorCode.errorUnlogin,
                    message: "登录过期,需要重新登录"
                });
            });
        } else {
            res.json({
                code: ErrorCode.errorUnlogin,
                message: "页面被重置,需要重新登录"
            });
        }
    });
    this.app.post("/register/*", function(req, res, next) {
        if (req.cookies) {
            var token = req.cookies.fcadmin;
            self.dbhelper.readToken(token, function(err, data) {
                if (err) {
                    res.json({
                        code: ErrorCode.errorRead,
                        message: err.message
                    });
                    return;
                }
                if (data) {
                    self.dbhelper.writeToken(token, data.v, function() {});
                    req.fcadmin = data.v;
                    next();
                    return;
                }
                res.json({
                    code: ErrorCode.errorUnlogin,
                    message: "登录过期,需要重新登录"
                });
            });
        } else {
            res.json({
                code: ErrorCode.errorUnlogin,
                message: "页面被重置,需要重新登录"
            });
        }
    });
    this.app.post("/updateConfig", function(req, res, next) {
        if (req.cookies) {
            var token = req.cookies.fcadmin;

            self.dbhelper.readToken(token, function(err, data) {
                if (err) {
                    res.json({
                        code: ErrorCode.errorRead,
                        message: err.message
                    });
                    return;
                }
                if (data) {
                    self.dbhelper.writeToken(token, data.v, function() {});
                    req.fcadmin = data.v;
                    next();
                    return;
                }
                res.json({
                    code: ErrorCode.errorUnlogin,
                    message: "登录过期,需要重新登录"
                });
            });
        } else {
            res.json({
                code: ErrorCode.errorUnlogin,
                message: "页面被重置,需要重新登录"
            });
        }
    });
    this.app.post("/*", auth(this.app));

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
        res.json({
            code: -1,
            message: "服务异常"
        });
    });
    this.app.listen(this.port);
    this.logger.info("平台服务启动完成,启动端口:%s", this.port);
};

dbinst.user.sync()
    .then(function() {
        return dbinst.data.sync();
    })
    .then(function() {
        return dbinst.game.sync();
    })
    .then(function() {
        return dbinst.gameapp.sync();
    })
    .then(function() {
        return dbinst.notice.sync();
    })
    .then(function() {
        return dbinst.unTimeCycleMessage.sync();
    })
    .then(function() {
        return dbinst.issueorder.sync();
    })
    .then(function() {
        return dbinst.warnlog.sync();
    })
    .then(function() {
        return dbinst.leadercarduse.sync();
    })
    .then(function() {
        return dbinst.leadernewuser.sync();
    })
    .then(function() {
        return dbinst.leaderonlineuser.sync();
    })
    .then(function() {
        return dbinst.leadercharge.sync();
    })
    .then(function() {
        return dbinst.leaderincome.sync();
    })
    .then(function() {
        return dbinst.proxycarduse.sync();
    })
    .then(function() {
        return dbinst.proxynewuser.sync();
    })
    .then(function() {
        return dbinst.proxyonlineuser.sync();
    })
    .then(function() {
        return dbinst.proxycharge.sync();
    })
    .then(function() {
        return dbinst.proxyincome.sync();
    })
    .then(function() {
        return dbinst.unioncarduse.sync();
    })
    .then(function() {
        return dbinst.unionnewuser.sync();
    })
    .then(function() {
        return dbinst.uniononlineuser.sync();
    })
    .then(function() {
        return dbinst.unioncharge.sync();
    })
    .then(function() {
        return dbinst.unionincome.sync();
    })
    .then(function() {
        return dbinst.admincarduse.sync();
    })
    .then(function() {
        return dbinst.adminnewuser.sync();
    })
    .then(function() {
        return dbinst.adminonlineuser.sync();
    })
    .then(function() {
        return dbinst.admincharge.sync();
    })
    .then(function() {
        return dbinst.adminincome.sync();
    })
    .then(function() {
        return dbinst.data_record.sync();
    })
    .then(function() {
        return dbinst.gamewinstatic.sync();
    })
    .then(function() {
        return dbinst.gamegolditem.sync();
    })
    .then(function() {
        return dbinst.gamecarditem.sync();
    })
    .then(function() {
        return dbinst.gamecardgive.sync();
    })
    .then(function() {
        return dbinst.gamechargeitem.sync();
    })
    .then(function() {
        return dbinst.gamecarduse.sync();
    })
    .then(function() {
        return dbinst.proxydatestatic.sync();
    })
    .then(function() {
        return dbinst.uniondatestatic.sync();
    })
    .then(function() {
        // 加载数据库 game 配置
        return dbinst.game.findAll()
            .then(function(datas) {
                config.update("gameList", {});
                for (var i = 0; i < datas.length; i++) {
                    config.update("gameList", datas[i].dataValues.id, datas[i].dataValues);
                }
                return new Promise(function(fulfill) { fulfill(); });
            });
    })
    .then(function() {
        // 加载数据库 game 配置
        return dbinst.gameapp.findAll()
            .then(function(datas) {
                var defaultGameAppId = "";
                config.update("gameappList", {});
                for (var i = 0; i < datas.length; i++) {
                    defaultGameAppId = datas[i].dataValues.id;
                    config.update("gameappList", datas[i].dataValues.id, datas[i].dataValues);
                }
                config.update("currentGameAppId", defaultGameAppId);
                return new Promise(function(fulfill) { fulfill(); });
            });
    })
    .then(function() {
        return new Promise(function(fulfill) {
            dblogclient.run(function(err) {
                if (err) {
                    logger.error("服务启动失败,连接 amq 异常,err:", err.stack);
                    return;
                }
                fulfill();
            });
        });
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
        var db = new DB({
            db: dbinst
        });
        var server = new Server({
            logger: logger,
            dbhelper: db
        });
        var job = require("./Helper/Job/Job.js")({
            dbhelper: db,
            logger: logger,
            config: config,
            CommonFunction: CommonFunction,
            Common: Common,
            ErrorCode: ErrorCode
        }); // JOB 任务加载
    })
    .catch(function(err) {
        logger.error("服务器启动失败 err:", err.stack);
    });