/**
 * Created by Administrator on 2015/9/23.
 */
var commonDef = require("../Common/CommonDefine.js");
var errorCode = require("../Common/ErrorCode.js");
var util = require("util");
var Promise = require("promise");
var thisModule = "pingppNotify";
/**
 * 处理  submit 请求
 *
 * @param app
 */
module.exports = function(app){
    app.get("/pingppNotify",function(req,res,next){
        app.dealStore.getOrder(req.query.out_trade_no)
            .then(function(result){
                if( result ){
                    global.logger.info("%s | reqData:%j result:%j success",thisModule, req.query,result);
                    res.render("payResult",{
                        title:"支付结果",
                        backLink:app.PAY_BACK_URL,
                        result:"支付完成"
                    });
                }else{
                    global.logger.error("%s | reqData:%j fail,订单不存在",thisModule, req.query);
                    res.render("payResult",{
                        title:"支付结果",
                        backLink:app.PAY_BACK_URL,
                        result:"订单不存在"
                    });
                }

                next();
            },function(err){
                global.logger.error("%s | reqData:%j fail,err:",thisModule, req.query,err);
                res.render("payResult",{
                    title:"支付结果",
                    backLink:app.PAY_BACK_URL,
                    result:"服务异常 稍后查询充值结果"
                });
                next();
            })
    });
    // upacp_wap 方式支付时 客户端进行 POST 的请求信息
    app.post("/upacp_wap",function(req,res,next){
        app.dealStore.getOrder(req.body.orderId)
            .then(function(result){
                if( result ){
                    var respMsg = "支付失败";
                    if( req.body.respMsg === "success" ){ // 如果支付成功 那么 respMsg 为 success
                        respMsg = "支付成功";
                    }
                    global.logger.info("%s | reqData:%j result:%j",thisModule, req.body,result);
                    res.render("payResult",{
                        title:"支付结果",
                        backLink:app.PAY_BACK_URL,
                        result:respMsg
                    });
                }else{
                    global.logger.error("%s | reqData:%j fail,订单不存在",thisModule, req.body);
                    res.render("payResult",{
                        title:"支付结果",
                        backLink:app.PAY_BACK_URL,
                        result:"订单不存在"
                    });
                }

                next();
            },function(err){
                global.logger.error("%s | reqData:%j fail,err:",thisModule, req.body,err);
                res.render("payResult",{
                    title:"支付结果",
                    backLink:app.PAY_BACK_URL,
                    result:"服务异常 稍后查询充值结果"
                });
                next();
            })
    });
    app.post("/pingppNotify",function(req,res,next){
        var status = req.body ;
        global.logger.debug("%s | reqData:%j  开始处理",thisModule, status );
        if( status.type ){
            notify[status.type](req,res,next,status);
        }else{
            global.logger.error("%s | 请求参数为空",thisModule);
            res.status(500);
            res.end();
            next();
        }
    });

    var notify = {
        "charge.succeeded":function(req,res,next,status){
            var orderId = status.data.object.order_no;
            app.dealStore.getOrder(orderId)
                .then(function(result){
                    return new Promise(function(fulfill){
                        if( result ){
                            // 需要进行判断撞到是否为 completed 如果是 那么无需理会此次充值
                            if( result.status === "completed" ){
                                global.logger.error("%s | reqData:%j 订单已经被处理",thisModule, status );
                                res.status(200);
                                res.end();
                                next();
                                return ;
                            }
                            global.logger.debug("%s | reqData:%j result:%j check status completed",thisModule, status,result);
                            fulfill(result);
                        }else{
                            global.logger.error("%s | reqData:%j orderId:%s 订单不存在",thisModule, status,orderId );
                            res.status(500);
                            res.end();
                            next();
                        }
                    });
                },function(err){
                    global.logger.error("%s | reqData:%j 获取订单信息 fail,err",thisModule, status, err );
                    res.status(500);
                    res.end();
                    next();
                })
                .then(function(result){
                    return app.dealStore.addStep(orderId,"completed",status);
                })
                .then(function(result){ // 进行物品交易逻辑
                    return new Promise(function(fulfill){
                        // 调用 游戏服务器接口 进行给玩家充值钻石
                        var uid  = result.goodsInfo.buyUserInfo.uid ;
                        if (typeof uid === 'string'){
                            uid = parseInt(uid);
                        }
                        var message = {
                            reqType: commonDef.REMOTE_CALL_BUSSINESS_TYPE.IncreaseGoods,
                            uid: uid,
                            goodsID:result.goodsInfo.id
                        };
                        global.logger.debug("%s | reqData:%j message%j remote call",thisModule, status,message);
                        global.remoteRequest.request(commonDef.REMOTE_CALL_MODULE_NAME, message, function (err, resu) {
                            if( err ){
                                global.logger.error("%s | reqData:%j message:%j 远程调用增加物品接口异常,err",thisModule, status, message,err );
                                res.status(500);
                                res.end();
                                next();
                            }else if(resu === false){
                                global.logger.error("%s | reqData:%j message:%j 远程调用增加物品接口失败",thisModule, status, message );
                                res.status(500);
                                res.end();
                                next();
                            }else{
                                global.logger.info("%s | reqData:%j success",thisModule, status );
                                res.end();
                                next();
                            }
                        });
                    })
                })
                .catch(function(err){
                    global.logger.error("%s | reqData:%j 服务异常 err:",thisModule, status, err );
                    res.status(500);
                    res.end();
                    next();
                });
        }
    }
}

