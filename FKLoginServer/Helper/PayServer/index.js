var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var cors = require('cors');
var ErrorCode = require("../../Common/ErrorCode");

function Server(opt){
    opt = opt || {};    
    this.port= opt.port || 13002;
    this.logger = opt.logger || {
        error:console.error,
        warn:console.log,
        info:console.log,
        debug:console.log
    };
    this.dbhelper = opt.dbhelper ;
    this.app = express();
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
            code:-1,
            message:"服务异常"
        });
    });
    this.app.listen(this.port);
    this.logger.info("支付服务启动完成,启动端口:%s",this.port);
}

module.exports = Server;