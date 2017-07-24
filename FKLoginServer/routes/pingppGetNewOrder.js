/**
 * Created by Administrator on 2015/9/23.
 */
var commonDef = require("../Common/CommonDefine.js");
var errorCode = require("../Common/ErrorCode.js");
var util = require("util");
var Promise = require("promise");
var ParamCheck = require("../Helper/ParamCheck/ParamCheck.js");
var thisModule = "pingppGetNewOrder";
/**
 * 处理  submit 请求
 *
 * @param app
 */
module.exports = function(app){
    app.get("/pingppGetNewOrder",function(req,res,next){
        ParamCheck().Check(req.query,["goodsId","uid"])
            .then(GetGoodsInfo,paramError)
            .then(genOrderId)
            .then(success)
            .catch(error);
        function GetGoodsInfo(){
            return global.DataManager.GetGoodsInfoById(req.query.goodsId);
        }
        function success(result){
            global.logger.info("%s | reqData:%j result:%j success",thisModule, req.query,result);
            res.json({
                code:0,
                orderInfo:result
            });
            next();
        }
        function error(err){
            global.logger.error("%s | reqData:%j fail,err:",thisModule, req.query,err);
            res.json({
                code:errorCode.errorLogicBase,
                message:err.message
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
        function genOrderId(goodsInfo){
            if( !goodsInfo ){
                return new Promise(function(fulfill,reject){
                    reject(new Error("物品信息不存在"));
                });
            }
            goodsInfo.buyUserInfo = {
                uid:req.query.uid
            }
            return app.dealStore.genOrder( goodsInfo );
        }
    });
}

