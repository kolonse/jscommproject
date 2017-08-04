/**
 * Created by Administrator on 2015/9/22.
 */
var Promise = require("promise");
var util = require("util");
var commonDef = require("../../../Common/CommonDefine.js");
/**
 * 获取所有支付类型
 * @returns {*}
 */
var LOCAL_PAY_TYPE_CACHE = null ;
module.exports = function(id){
    return new Promise(function(fulfill,reject){
        if( LOCAL_PAY_TYPE_CACHE ){ // 如果本地缓存有数据 那么就使用缓存 没有则从数据库中获取数据
            fulfill(LOCAL_PAY_TYPE_CACHE[id]);
            return ;
        }
        var sql = util.format("select * from %s",commonDef.RMB_SHOP_INFO );
        global.DBManager.tableRMBShopInfo.findAll()
            .then(function(result){
                if( result.length === 0 ) { fulfill(null);return ;};
                LOCAL_PAY_TYPE_CACHE = {};
                for( var i = 0; i < result.length; i ++ ){
                    var value = result[i].dataValues ;
                    LOCAL_PAY_TYPE_CACHE[value.id] = value;
                }
                fulfill(LOCAL_PAY_TYPE_CACHE[id]);
            })
            .catch(function(err){
                reject(err);
            })
    });
}