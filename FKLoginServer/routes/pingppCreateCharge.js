/**
 * Created by Administrator on 2015/9/24.
 */

var commonDef = require("../Common/CommonDefine.js");
var config = require("../config/config.js");
var errorCode = require("../Common/ErrorCode.js");
var util = require("util");
var Promise = require("promise");
var thisModule = "pingppCreateCharge";
/**
 * 处理  submit 请求
 *
 * @param app
 */
module.exports = function(app){
    app.post("/pingppCreateCharge",function(req,res,next){
        app.dealStore.getOrder(req.body.order_no)
            .then(createCharge)
            .then(success)
            .catch(error)
        function success(charge){
            global.logger.info("%s | reqData:%j charge:%j success",thisModule, req.body,charge);
            res.json(charge);
            next();
        }

        function error(err){
            global.logger.error("%s | reqData:%j fail,err:",thisModule, req.body,err);
            res.json({
                type:"invalid_request_error",
                message:err.message
            });
            next();
        }
        function createCharge(orderInfo){
            return new Promise(function(fulfill,reject){
                if( !orderInfo ){
                    return reject(new Error("该订单信息不存在 已经过期"));
                }
                // 填充该支付方式的 extra  参数
                var extra = null ;
                if( req.body.channel && app.pingppConfig.channel_extra[req.body.channel] ){
                    extra = app.pingppConfig.channel_extra[req.body.channel];
                }
                var pingppReqData = {
                    subject: orderInfo.goodsInfo.name,
                    body: orderInfo.goodsInfo.desc,
                    amount: orderInfo.goodsInfo.price * 100,
                    order_no: req.body.order_no,
                    channel: req.body.channel,
                    currency: "cny", //表示 RMB
                    client_ip: "127.0.0.1",
                    app: {id: app.pingppConfig.appId},
                    extra:extra
                };
                app.pingpp.charges.create(pingppReqData, function(err, charge) {
                    //  将订单凭据进行存储
                    var resData = charge || typeof err==="string"?err:err.message ;
                    var storeData = {
                        detail:"请求创建订单完成",
                        reqData:pingppReqData,
                        resData:resData
                    }
                    app.dealStore.addStep(req.body.order_no,"charges.create",storeData).then(function(data){
                        global.logger.debug("%s | store data:%j success",thisModule, storeData );
                    },function(e){
                        global.logger.error("%s | store data:%j fail,err",thisModule, storeData, e );
                    });

                    if(err){reject(err);return; }
                    fulfill(charge);
                });
            });
        }
        function getOrder(orderId){
            return app.pingpp.getOrder(orderId);
        }
    });
}

