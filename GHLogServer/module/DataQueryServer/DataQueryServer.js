/**
 * Created by Administrator on 2015/10/31.
 * 数据查询服务 提供一个HTTP接口 并提供POST方法
 */
var HttpServer = require('express');
var util = require("util");
var events = require("events");
var bodyParser = require('body-parser');
var Code = require("../../ErrorCode.js");
var os = require("os");
var fs = require("fs");
//var dnode = require("dnode");
var net = require('net');

var readStat = function( cb ) {
    fs.readFile( "/proc/stat", function( err, data ) {
        cb( data.toString( ) );
    } );
}

var DataQueryServer = function(opt){
//    this.rpcServer = null ;
    this.bRun = opt.bRun || true ; //默认是运行
    /**
     * 如果当前配置了 --dqs=false 那么就不运行查询服务
     */
    for( var i = 2; i < process.argv.length; i ++ ){
        if( process.argv[i] === "--dqs=false"){
            this.bRun = false ;
        }
    }
    this.listenPort = opt.listenPort || 11010;
    this.logger = opt.logger || console;
    this.server = HttpServer();
    events.EventEmitter.call(this);
}
util.inherits(DataQueryServer, events.EventEmitter);

DataQueryServer.prototype.run = function(){
    var self = this ;
    var pub = __dirname + '/public';
    var view = __dirname + '/views';
    this.server.use(HttpServer.static(pub));
    this.server.set('view engine', 'html');
    this.server.set('views', view);//配置视图
    this.server.set('basepath', __dirname);//配置根目录
    this.server.engine('.html', require('ejs').__express);
    this.server.use(bodyParser.json());
    this.server.use(bodyParser.urlencoded({ extended: true }));
    this.server.post("/exec",function(req,res){
        self.emit("exec",req.body,function(result){
            if(result){
                res.json(result);
            }else{
                res.json({
                    code:0
                });
            }
        });
    });
    this.server.post("/execPipe",function(req,res){
//        res.contentType('json');
        self.emit("execPipe",req.body,res,function(result){
            if(result.code !== 0){
                res.end();
            }
        });
    });
//    this.rpcServer = net.createServer(function (c) {
//        c.on("data",function(data){
//            d.write(data);
//        })
//        c.on("error",function(err){
//            self.logger.warn("RPC 服务出现异常 err:",err);
//        })
//        var d = dnode({
//            exec:function(reqParam,cb){
//                self.emit("exec",reqParam,function(result){
//                    if(result){
//                        cb(result);
//                    }else{
//                        cb({
//                            code:0
//                        });
//                    }
//                });
//            }
//        });
//        d.on("error",function(err){
//            self.logger.error("dnode 出现异常 err:",err);
//        });
//        d.on("data",function(data){
//            c.write(data);
//        });
//    });

    this.server.get("/",function(req,res){
        console.log(os.platform());
        if( /win32/.test(os.platform()) ){
            res.redirect("/windows/");
        }else{
            res.redirect("/linux/");
        }
    })
    this.server.get("/linux/",function(req,res){
        res.render("index");
    });
    this.server.get("/linux",function(req,res){
        res.redirect("/linux/");
    });
    var prevTotal = 0;
    var prevIdle = 0;
    var prevLoad = 0;
    this.server.get("/linux/cpu-usage",function(req,res){
        readStat( function( data ) {
            var dRaw = data.split( ' ' );
            var d = [];
            var idx = 1;
            var count = 0;
            while( count < 4 ) {
                var t = parseInt( dRaw[ idx ] );
                if( t ) {
                    count++;
                    d.push( t );
                }
                idx++;
            }

            var idle = parseInt( d[ 3 ] );
            var total = parseInt( d[ 0 ] ) + parseInt( d[ 1 ] ) + parseInt( d[ 2 ] );
            var load = 0;

            if( prevTotal != 0 ) {
                load = Math.round( ( total - prevTotal ) / ( total + idle - prevTotal - prevIdle ) * 100 );
                res.json({
                    code:0,
                    data:[load]
                });
            }

            prevLoad = load;
            prevTotal = total;
            prevIdle = idle;
        } );
    });
    this.server.get("/linux/cpu-info",function(req,res){
        res.end();
    });
    this.server.get("/windows/",function(req,res){
        res.render("index");
    });
    this.server.get("/windows",function(req,res){
        res.redirect("/windows/");
    });
    this.server.get("/windows/cpu-usage",function(req,res){
        var cpu = require('windows-cpu');
        cpu.totalLoad(function(err,results){
            if( err ){
                res.json({
                    code:Code.ErrorSystemExcept,
                    message:err.message
                });
            }
            else{
                res.json({
                    code:0,
                    data:results
                });
            }
        });
    });
    this.server.get("/windows/cpu-info",function(req,res){
        var cpu = require('windows-cpu');
        cpu.cpuInfo(function(err,results){
            if( err ){
                res.json({
                    code:Code.ErrorSystemExcept,
                    message:err.message
                });
            }
            else{
                res.json({
                    code:0,
                    data:results
                });
            }
        });
    });
    if( this.bRun ){
        this.server.listen(this.listenPort);
//        this.rpcServer.listen(parseInt(this.listenPort) + 1);
        this.logger.info("Server Start At Port " + this.listenPort);
//        this.logger.info("RPC Server Start At Port " + (parseInt(this.listenPort) + 1));
    }else{
        this.logger.info("查询服务配置为不运行");
    }
}

module.exports = function( opt ){
    return new DataQueryServer(opt)
}
