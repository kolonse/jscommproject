var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var cors = require('cors');
var ErrorCode = require("../../Common/ErrorCode");
var fs = require("fs");
var CommonFunction = require("../../Common/CommonFunction");

function Server(opt) {
    opt = opt || {};
    this.name = opt.name || "平台服务";
    this.port = opt.port || 14004;
    this.logger = opt.logger || {
        error: console.error,
        warn: console.log,
        info: console.log,
        debug: console.log
    };
    this.dbhelper = opt.dbhelper;
    this.app = express();
    this.redis = opt.redis;
    this.apps = opt.apps;
    this.app.token_prefix = "wx_token_";
    this.app.token_expire = 7 * 24 * 60 * 60;
    this.app.token_min_expire = 1 * 60;
    this.init();
}

var pt = Server.prototype;
pt.init = function() {
    var self = this;
    this.app.logger = this.logger;
    this.app.dbhelper = this.dbhelper;
    this.app.ErrorCode = ErrorCode;
    this.app.redis = this.redis;
    this.app.CommonFunction = CommonFunction;
    this.app.apps = this.apps;
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(multer());
    this.app.get("/readme.html", function(req, res) {
        res.write(fs.readFileSync("./readme.html"));
        res.end();
    });
    require("fs").readdirSync(__dirname + '/routes').forEach(function(filename) {
        if (/\.js$/.test(filename)) {
            require(__dirname + '/routes/' + filename)(self.app);
        }
    });
    this.app.use(function(err, req, res, next) {
        var param = req.method === "GET" ? req.query : req.body;
        self.logger.error("%s %j 处理异常,err:", req.path, param, err.stack);
        res.json({
            code: -1,
            message: "服务异常"
        });
    });
    this.app.listen(this.port);
    this.logger.info("%s 启动完成,启动端口:%s", this.name, this.port);
};

module.exports = Server;