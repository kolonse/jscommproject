var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var cors = require('cors');
var ErrorCode = require("../../Common/ErrorCode");
var https = require("https");
var fs = require("fs");
var privateKey  = fs.readFileSync(__dirname + '/crt/private.pem', 'utf8');
var certificate = fs.readFileSync(__dirname + '/crt/file.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

function Server(opt){
    opt = opt || {};    
    this.port= opt.port || 14000;
    this.logger = opt.logger || {
        error:console.error,
        warn:console.log,
        info:console.log,
        debug:console.log
    };
    this.app = express();
    this.httpsServer = https.createServer(credentials, this.app);
    this.init();
}

var pt = Server.prototype;
pt.init = function(){
    var self = this;
    this.app.logger = this.logger ;
    this.app.dbhelper = this.dbhelper;
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(multer());

    require("fs").readdirSync(__dirname + '/routes').forEach(function(filename) {
        if (/\.js$/.test(filename )) {
            require( __dirname + '/routes/' + filename )(self.app);
        }
    });
    this.app.use(function (err, req, res, next) {
        var param = req.method === "GET"?req.query:req.body;
        self.logger.error("%s %j 处理异常,err:",req.path,param,err.stack);
        res.json({
            errcode:-1,
            errmsg:"服务异常"
        });
    });
    this.httpsServer.listen(this.port);
    this.logger.info("测试平台服务启动完成,启动端口:%s",this.port);
}

module.exports = Server;