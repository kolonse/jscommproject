/**
 * Created by Administrator on 2015/9/21.
 */
var commonDef = require("../Common/CommonDefine.js");
var config = require("../config/config.js");
var errorCode = require("../Common/ErrorCode.js");
var conmmonFunc = require("../Common/CommonFunction.js");
var HttpClient = require("../Helper/HttpClient/HttpClient.js");
var util = require("util");
var merge = require('merge');
var Promise = require("promise");
var ParamCheck = require("../Helper/ParamCheck/ParamCheck.js");
var thisModule = "submit";
/**
 * 处理  submit 请求
 *
 * @param app
 */
module.exports = function(app){
    app.get("/submit",function(req,res,next){
        var payFunc = global.PayManager[req.query.payType] ;
        if( !payFunc ){
            global.logger.error("%s | reqData:%j 支付类型不支持 fail",thisModule, req.query);
            res.json({
                code:errorCode.errorDataInput,
                message:"支付类型不支持"
            });
            next();
            return ;
        }
        ParamCheck().Check(req.query,["payType","goodsId"])
            .then(genOrderId,paramError)
            .then(payFunc)
            .then(success)
            .catch(error);
        function success(result){
            global.logger.info("%s | reqData:%j statusCode:%s success",thisModule, req.query,result.response.statusCode);
            res.send(result.body);
            res.end();
//            res.json({
//                code:0,
//                data:result
//            });
            next();
        }
        function error(err){
            global.logger.error("%s | reqData:%j fail,err:",thisModule, req.query,err);
            res.json({
                code:errorCode.errorLogicBase,
                message:"服务异常 稍后重试"
            });
            next();
        }
        function paramError(data){
            return new Promise(function(){
                global.logger.error("%s | reqData:%j result:%j fail",thisModule, req.query,data);
                res.json({
                    code:errorCode.errorDataInput,
                    message:data.message
                });
                next();
            });
        }
        function genOrderId(){
            return app.dealStore.genOrder( req.query );
        }
    });
}

