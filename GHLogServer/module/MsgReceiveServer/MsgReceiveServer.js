'use strict';
/**
 * Created by Administrator on 2015/10/27.
 * 消息接收服务 使用 amqp10消息接收协议
 *
 * opt={
 *      uri:"amqp://localhost",// default uri
 *      logger:console, // default console  用来自定义 logger 引擎
 *      name:"amq.msg.queue", //default amq.msg.queue 从activemq 接收的消息接收器名字
 * }
 */
var util = require("util");
var events = require("events");
var AMQPClient = require("amqp10").Client;
var Middle = require("./Middle");
console.debug = console.trace;
var MsgReceiveServer = function(opt){
    opt = opt || {} ;
    this.logger = opt.logger || console ;
    this.uri = opt.uri || "amqp://localhost" ;
    this.name = opt.name || "amq.msg.queue" ;
    this.client = new AMQPClient();
    this.middle = Middle.New();
    events.EventEmitter.call(this);
}
util.inherits(MsgReceiveServer, events.EventEmitter);
MsgReceiveServer.prototype.run = function(){
    var self = this ;
    self.client.connect(this.uri)
        .then(function(){
            // 创建接收者
            return self.client.createReceiver(self.name);
        })
        .then(function(receiver){
            receiver.on("message",function(message){
                if( message.body instanceof Buffer ){
                    message.body = message.body.toString();
                    try{
                        var value = JSON.parse(message.body);
                        message.body = value ;
                    }catch(e){

                    }
                }
                self.middle.Call(message.body,function(){
                    self.emit("data",message.body)
                });
            });
            receiver.on("errorReceived",function(err){
                //self.emit("errorReceived",err)
                // 如果是接收到异常数据 那么不传给用户层 直接打印警告日志
                self.logger.warn("receive <- " + err);
            })
        })
        .catch(function(err){
            // 出现错误那么要通知用户层
            //self.logger.warn("receive <- " + err);
            self.emit("error",err)
        });
}

MsgReceiveServer.prototype.use = function(){
    this.middle.Use.apply(this.middle,arguments);
}

module.exports = function(opt){
    var ret = new MsgReceiveServer(opt);
    return ret ;
}