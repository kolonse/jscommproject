'use strict';
/**
 * Created by Administrator on 2015/10/27.
 * 消息发送客户端 使用 amqp10消息协议
 *
 * opt={
 *      uri:"amqp://localhost",// default uri
 *      logger:console, // default console  用来自定义 logger 引擎
 *      name:"amq.msg.queue", //default amq.msg.queue 从activemq 接收的消息接收器名字
 * }
 *
 * usage:
 * var client = require("MsgSenderClient");
 * client.send({...},function(){});
 */
var AMQPClient = require("amqp10").Client;
console.debug = console.trace;
var MsgSenderClient = function(opt){
    opt = opt || {
        reconnect:{
            forever:true,
            strategy: 'fibonacci',
            retries:10
        }
    } ;
    this.opt = opt ;
    this.logger = opt.logger || console ;
    this.uri = opt.uri || "amqp://localhost" ;
    this.name = opt.name || "amq.msg.queue" ;
    this.client = new AMQPClient();
    this.sender = null ;
}

MsgSenderClient.prototype.run = function(callback){
    var self = this ;
    callback = callback || function(){} ;
    self.client.connect(this.uri)
        .then(function(){
            // 创建接收者
            return self.client.createSender(self.name);
        })
        .then(function(sender){
            self.sender = sender ;
            callback(null);
        })
        .catch(function(err){
            // 出现错误那么要通知用户层
            callback(err);
        });
}

MsgSenderClient.prototype.send = function(message,callback){
    callback = callback || function(){} ;
    var self = this ;
    if(self.sender){
        self.sender.send(message)
            .then(function(){
                callback(null);
            })
            .catch(function(err){
                callback(err)
            });
    }else{
        callback(new Error("当前发送器未创建成功"));
    }
}

MsgSenderClient.prototype.sendMsg = function(event,data,callback){
    var message = {
        event:event,
        createAt:new Date(),
        data:data
    }
    this.send(message,callback);
}

module.exports = function(opt){
    var ret = new MsgSenderClient(opt);
    //ret.run();
    return ret ;
}