'use strict';
/**
 * Created by Administrator on 2015/10/28.
 * 存储引擎
 */
// 先使用 mongo db 进行存储
var Promsise = require("promise");
var Code = require("../../ErrorCode.js");
var Stream = require('stream').Stream;

var store = function(opt){
    opt = opt || {} ;
    this.logger = opt.logger || console ;
    this.uri = opt.uri || "mongodb://localhost/storeServer";
    // 默认表结构
    var defaultSchema = {
        event:String,
        data:Object
    };
    var schema = opt.schema || defaultSchema ;
    if(!schema.event){ // 如果 event 为空那么给一个默认值,表示该模式的关键字为空
        schema.event = String;
    }
    this.mongoose = require("mongoose");
//    this.mongoose.plugin(require('mongoose-write-stream'));
    this.mongoose.set('debug', opt.debug || true);
    this.mongoose.connect(this.uri,{
		server:{
			socketOptions:{
				connectTimeoutMS:1 * 3600 * 1000,
				socketTimeoutMS:1 * 3600 * 1000
			}
		}
	});
    this.schema = new this.mongoose.Schema(schema);
    this.model = {}; // 先让 model 为空 后续消息到来时在进行动态增加
}

function isEmptyObject(O){
    for (var x in O){
        return false;
    }
    return true;
}

store.prototype.checkMessage = function(message){
    if( !(message instanceof Object) ){
        return new Error("消息格式必须为对象");
    }
    // 检查 event 字段 不能为空
    if( message.event === undefined || message.event === null ){
        return new Error("消息必须存在 event 且不能为空");
    }
    if( !(typeof message.event === "string") ){
        return new Error("消息 event 字段必须为 String");
    }
    if( message.event === "" ){
        return new Error("消息 event 字段不能为空");
    }
    // 检查 data 字段 不能为空
    if( message.data === undefined || message.data === null ){
        return new Error("消息必须存在 data 且不能为空");
    }

    if( !(message.data instanceof Object) ){
        return new Error("消息 data 字段必须为 Object");
    }
    if( isEmptyObject(message.data) ){
        return new Error("消息 data 字段不能为空");
    }
    return null ;
}

store.prototype.Add = function(message){
    var self = this ;
    return new Promsise(function(fulfill,reject){
        /**
         * 1.检查消息格式 是否为 schema 类型
         */
        var e = self.checkMessage(message);
        if( e ) {reject(e);return;}
        var event = message.event ;
        var model = self.model[event] ;
        if( !model ){ //如果该模式不存在 那么重新创建
            self.logger.info("%s 不存在 创建模式",event);
            model = self.mongoose.model(event,self.schema);
            self.model[event] = model ;
        }
        var data = new model(message);
        data.save(function(err){
            if(err){reject(err);}
            else {fulfill(null)}
        })
    });
}

function objectPush(arg,elem){
    var i = 0 ;
    var ret = [] ;
    for( var key in arg ){
        i = parseInt(key);
        if( i !== 0 ){
            ret.push(arg[key]);
        }
    }
    ret.push(elem) ;
    return ret ;
}

store.prototype.find = function(){
    var self = this ;
    var arg = arguments ;
    var event = arg[0];
    return new Promise(function(fulfill,reject){
        var model = self.model[event] ;
        if( !model ){ //如果该模式不存在 那么重新创建
            self.logger.info("%s 不存在 创建模式",event);
            model = self.mongoose.model(event,self.schema);
            self.model[event] = model ;
        }
        var cb = function(err,result){
            if(err){
                reject(err);
            }else{
                fulfill(result);
            }
        }
        arg = objectPush(arg,cb);
        model.find.apply(model, arg );
    });
}

store.prototype.parseNextMethods = function(data){
    var ret = [];
    var methods = data.nextMethods ;
    if( !(methods instanceof Array) ){
        fulfill({
            code:Code.ErrorDataInput,
            message: "methods 字段不是数组"
        });
        return ;
    }
    var func = null ;
    for( var i = 0; i < methods.length; i ++ ){
        var methodObj = methods[i];
        if( !(methodObj instanceof Object) ){
            fulfill({
                code:Code.ErrorDataInput,
                message: " methods["+ i + "] 字段不是对象"
            });
            return ;
        }
        var method = methodObj.method;
        var arg = methodObj.arg ;

    }
}

store.prototype.exec = function(data){
    var self = this ;
    return new Promise(function(fulfill,reject){
        if( !data.event ){
            fulfill({
                code:Code.ErrorDataInput,
                message: "event 字段丢失"
            });
            return ;
        }
        var model = self.model[data.event] ;
        if( !model ){ //如果该模式不存在 那么重新创建
            self.logger.info("%s 不存在 创建模式",data.event);
            model = self.mongoose.model(data.event,self.schema);
            self.model[data.event] = model ;
        }
        var method = data.method ;
        if( !method ){ // 数据的 method 必须存在 提示用户输入数据错误
            fulfill({
                code:Code.ErrorDataInput,
                message: "method 字段丢失"
            });
            return ;
        }
        var func = model[method];
        if( !func || !(func instanceof Function)){ // 如果方法对应的函数不存在 那么直接返回用户提示输入数据错误
            fulfill({
                code:Code.ErrorDataInput,
                message: method + " 方法不支持"
            });
            return;
        }

        var cb = function(err,result){
            if(err){
                reject(err);
            }else{
                fulfill({
                    code:0,
                    data:result
                });
            }
        }
        var arg= data.arg ;
        if( !(arg instanceof Array)){// 如果不是数组 那么提示用户
            self.logger.warn("method:%s arg:%j 不是数组类型,忽略该参数",method,arg);
            arg = [] ;
        }
        var query = func.apply(model,arg);
        var nextMethods = data.nextMethods ;
        if(nextMethods instanceof Array){
            for( var i = 0; i < nextMethods.length; i ++ ){
                var methodObj = nextMethods[i];
                var method = methodObj.method ;
                var arg= methodObj.arg ;
                var func = query[method];
                if( !func ){
                    fulfill({
                        code:Code.ErrorDataInput,
                        message:method + " 方法不支持"
                    })
                    return ;
                }
                if( !(arg instanceof Array)){// 如果不是数组 那么提示用户
                    self.logger.warn("method:%s arg:%j 不是数组类型,忽略该参数",method,arg);
                    arg = [] ;
                }
                query = func.apply(query,arg);
            }
        }
        query.exec(cb);
    });
}

store.prototype.execPipe = function(data,stream){
    var self = this ;
    return new Promise(function(fulfill,reject){
        if( !data.event ){
            fulfill({
                code:Code.ErrorDataInput,
                message: "event 字段丢失"
            });
            return ;
        }
        var model = self.model[data.event] ;
        if( !model ){ //如果该模式不存在 那么重新创建
            self.logger.info("%s 不存在 创建模式",data.event);
            model = self.mongoose.model(data.event,self.schema);
            self.model[data.event] = model ;
        }
        var method = data.method ;
        if( !method ){ // 数据的 method 必须存在 提示用户输入数据错误
            fulfill({
                code:Code.ErrorDataInput,
                message: "method 字段丢失"
            });
            return ;
        }
        var func = model[method];
        if( !func || !(func instanceof Function)){ // 如果方法对应的函数不存在 那么直接返回用户提示输入数据错误
            fulfill({
                code:Code.ErrorDataInput,
                message: method + " 方法不支持"
            });
            return;
        }

        var cb = function(err,result){
            if(err){
                reject(err);
            }else{
                fulfill({
                    code:0,
                    data:result
                });
            }
        }
        var arg= data.arg ;
        if( !(arg instanceof Array)){// 如果不是数组 那么提示用户
            self.logger.warn("method:%s arg:%j 不是数组类型,忽略该参数",method,arg);
            arg = [] ;
        }
        var query = func.apply(model,arg);
        var nextMethods = data.nextMethods ;
        if(nextMethods instanceof Array){
            for( var i = 0; i < nextMethods.length; i ++ ){
                var methodObj = nextMethods[i];
                var method = methodObj.method ;
                var arg= methodObj.arg ;
                var func = query[method];
                if( !func ){
                    fulfill({
                        code:Code.ErrorDataInput,
                        message:method + " 方法不支持"
                    })
                    return ;
                }
                if( !(arg instanceof Array)){// 如果不是数组 那么提示用户
                    self.logger.warn("method:%s arg:%j 不是数组类型,忽略该参数",method,arg);
                    arg = [] ;
                }
                query = func.apply(query,arg);
            }
        }

        var format = new ArrayFormatter;
        query.cursor().pipe(format).pipe(stream);
        format.on("end",function(){
            cb(null,null);
        })
    });
}

module.exports = function( opt ){
    return new store(opt)
}

function ArrayFormatter () {
    Stream.call(this);
    this.writable = true;
    this._done = false;
}

ArrayFormatter.prototype.__proto__ = Stream.prototype;

ArrayFormatter.prototype.write = function (doc) {
    doc = doc.data;
    this.emit('data', JSON.stringify(doc) + "\n" );
    return true;
}

ArrayFormatter.prototype.end = ArrayFormatter.prototype.destroy = function () {
    if (this._done) return;
    this._done = true;
    this.emit('end');
}