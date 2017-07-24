'use strict';
/**
 * Created by Administrator on 2015/10/28.
 * 数据存储服务
 * 数据格式必须为:
 * {
 *  event:xxx,
 *  data:{}  // data 就是要存储的内容
 * }
 */
var store = require("./store.js");
var DataStoreServer = function(opt){
    opt = opt || {} ;
    this.logger = opt.logger || console ;
    this.store = store( opt );
}

/**
 * 检查消息格式
 * {
 *  event:"",
 *  data:{} //必须为对象
 * }
 * @param message
 * @returns {*}
 */
DataStoreServer.prototype.Add = function(message){
    return this.store.Add.apply(this.store,arguments);
}
/**
 * 参数格式
 * arg[0] 表示模块名字  必须有
 * arg[1] 表示查询条件 可以没有
 * @returns {*}
 */
DataStoreServer.prototype.find = function(){
    return this.store.find.apply(this.store,arguments);
}
/**
 * 数据库操作语句执行方法
 * @returns {*}
 */
DataStoreServer.prototype.exec = function(){
    return this.store.exec.apply(this.store,arguments);
}

DataStoreServer.prototype.execPipe = function(){
    return this.store.execPipe.apply(this.store,arguments);
}
module.exports = function( opt ){
    return new DataStoreServer(opt)
}