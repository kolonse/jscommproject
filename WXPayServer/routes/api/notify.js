var Https = require("../../Helper/HttpsClient/httpsClient.js");
var Http = require("../../Helper/HttpClient/HttpClient");
var moment = require("moment");
var Promise = require("promise");
var util = require("util");
module.exports = function(app) {
    /**
     * 客户端支付请求接口 get/post 均支持
     * 客户端会发送支付请求 带有游戏的 appid,goodsid 字段
     * query:
     *  gappId
     *  goodsId
     */
    var nonceExpireTime = app.config.get("nonceExpireTime");
    var lockExpireTime = app.config.get("lockExpireTime");
    var shopinfo = app.config.get("shopinfo");
    var SEQ = 0;

    app.get("/api/notify", function(req, res) {
        var param = req.query;
        processReq(param, res);
    });
    app.post("/api/notify", function(req, res) {
        var param = req.body;
        processReq(param, res);
    });

    function processReq(param, res) {
        var payAppId = param.xml.attach[0];
        var payApp = app.apps[payAppId];
        if (!payApp) {
            res.wxpayxml({
                return_code: "FAIL",
                return_msg: "参数格式化错误"
            });
            app.logger.error("请求异常,支付失败 %j 应用不存在", param);
            return;
        }
        var game_notify_url = payApp.game_notify_url;
        var mch_key = payApp.mch_key;
        if (!param || !param.xml || param.xml.return_code[0] !== "SUCCESS") {
            res.wxpayxml({
                return_code: "FAIL",
                return_msg: "参数格式化错误"
            }, mch_key);
            app.logger.error("订单通知 %j 消息格式异常", param);
            return;
        }
        var value = {};
        for (var k in param.xml) {
            value[k] = param.xml[k][0];
        }
        checkSign(value).then(checkNonce).then(process)
            .catch(function(err) {
                res.wxpayxml({
                    return_code: "FAIL",
                    return_msg: "参数格式化错误"
                }, mch_key);
                app.logger.error("订单通知 %j 处理异常,err:", param, err.stack);
            });

        function checkNonce(data) {
            return new Promise(function(fulfill) {
                var nonce = data.nonce_str;
                // 校验 nonce 
                app.redis.get("nonce_" + nonce, function(err, v) {
                    if (err) {
                        res.wxpayxml({
                            return_code: "FAIL",
                            return_msg: "nonce 检查异常"
                        }, mch_key);
                        app.logger.error("订单通知 %j 校验nonce异常,err:", param, err.stack);
                        return;
                    }
                    if (v) {
                        res.wxpayxml({
                            return_code: "FAIL",
                            return_msg: "nonce 重复请求"
                        }, mch_key);
                        app.logger.error("订单通知 %j 校验nonce失败,nonce 重复请求 %j", param, data);
                        return;
                    }
                    app.redis.set("nonce_" + nonce, 1, nonceExpireTime, function(err) {
                        if (err) {
                            res.wxpayxml({
                                return_code: "FAIL",
                                return_msg: "nonce 存储异常"
                            }, mch_key);
                            app.logger.error("订单通知 %j 存储 nonce 异常,err:", param, err.stack);
                            return;
                        }
                        fulfill(data);
                    });
                });
            });
        }

        // check 签名
        function checkSign(data) {
            var sign = data.sign;
            delete data.sign;
            return new Promise(function(fulfill) {
                if (app.wxSig.GenSig(data, mch_key) !== sign) {
                    res.wxpayxml({
                        return_code: "FAIL",
                        return_msg: "签名失败"
                    }, mch_key);
                    app.logger.error("订单通知 %j 校验签名失败 %j", param, data);
                    return;
                }
                fulfill(data);
            });
        }

        function process(data) {
            var orderId = data.out_trade_no;
            // 进行加锁....
            var lock_resource = "lock_resource:" + orderId;
            app.logger.debug("lockbefore ", lock_resource);
            app.redlock.lock(lock_resource, lockExpireTime).then(function(lock) {
                app.logger.debug("lockafter ", lock_resource);
                return processOrder().then(function() {
                    return lock.unlock().then(function() {
                        app.logger.debug("lockend ", lock_resource);
                    }).catch(function(err) {
                        app.logger.warn("订单通知,锁资源 %s 出现异常,等待锁过期,err:", lock_resource, err.stack);
                    });
                });
            }).catch(function(err) {
                res.wxpayxml({
                    return_code: "FAIL",
                    return_msg: "订单正在被处理"
                }, mch_key);
                app.logger.error("订单通知 %j,加锁异常,err:", param, err.stack);
            });

            function processOrder() {
                return new Promise(function(over) {
                    app.dbhelper.read("pay", { orderId: orderId }, ["status", "price", "uid", "id", "shopid", "time_start", "trade_type"], [0, 1], function(err, v) {
                        if (err) {
                            res.wxpayxml({
                                return_code: "FAIL",
                                return_msg: "商家服务系统异常"
                            }, mch_key);
                            app.logger.error("订单通知 %j 读取数据失败,err:", param, err.stack);
                            over();
                            return;
                        }

                        // 检测当前是否存在该订单
                        if (v.length === 0) {
                            res.wxpayxml({
                                return_code: "FAIL",
                                return_msg: "当前订单不存在"
                            }, mch_key);
                            app.logger.error("订单通知 %j 订单不存在", param);
                            over();
                            return;
                        }
                        // 检查数据库状态是否已经是 处理完成,如果已经处理完成那么返回成功,但是不进行给玩家充值
                        v = v[0].dataValues;

                        // 如果订单已经处理完成, 那么告诉微信不需要继续处理
                        if (v.status === app.Common.ORDER_STATUS.done) {
                            res.wxpayxml({
                                return_code: "SUCCESS",
                                return_msg: "OK"
                            }, mch_key);
                            app.logger.info("订单通知 %j 订单已经被处理", param);
                            over();
                            return;
                        }

                        function check() {
                            // 校验 result_code
                            if (data.result_code !== "SUCCESS") {
                                return fail();
                            }
                            return success();
                        }

                        function fail() {
                            return new Promise(function(fulfill) {
                                app.dbhelper.update("pay", {
                                    status: app.Common.ORDER_STATUS.fail,
                                    err_code: data.err_code,
                                    err_code_des: data.err_code_des,
                                    transaction_id: data.transaction_id,
                                    time_end: data.time_end
                                }, { id: v.id }, function(err) {
                                    if (err) {
                                        res.wxpayxml({
                                            return_code: "FAIL",
                                            return_msg: "存储记录异常"
                                        }, mch_key);
                                        app.logger.info("订单通知 %j 失败的订单 存储记录异常,err:", param, err.stack);
                                        fulfill();
                                    }
                                    res.wxpayxml({
                                        return_code: "SUCCESS",
                                        return_msg: "OK"
                                    }, mch_key);
                                    app.logger.info("订单通知 %j 失败的订单 处理完成", param);
                                    fulfill();
                                });
                            });
                        }

                        function success() {
                            return checkPrice().then(sendGoods).then(storeData).catch(function(err) {
                                return new Promise(function(fulfill) { fulfill(); });
                            });
                        }

                        function checkPrice() {
                            // 校验货币价格是否和存储的相同
                            return new Promise(function(fulfill, reject) {
                                if (parseInt(v.price) !== parseInt(data.total_fee)) {
                                    // 价格不匹配错误 errPrice
                                    app.dbhelper.update("pay", {
                                        status: app.Common.ORDER_STATUS.errPrice,
                                        transaction_id: data.transaction_id,
                                        err_code: data.err_code,
                                        err_code_des: "订单通知价格与存储价格不相等",
                                        time_end: data.time_end,
                                    }, { id: v.id }, function(err) {
                                        if (err) {
                                            res.wxpayxml({
                                                return_code: "FAIL",
                                                return_msg: "订单价格与存储价格不相等"
                                            }, mch_key);
                                            app.logger.error("订单通知 %j 订单价格与存储价格不相等,存储记录异常,err:", param, err.stack);
                                            reject();
                                        }
                                        res.wxpayxml({
                                            return_code: "FAIL",
                                            return_msg: "订单价格与存储价格不相等"
                                        }, mch_key);
                                        app.logger.error("订单通知 %j 订单价格与存储价格不相等", param);
                                        reject();
                                    });
                                    return;
                                }
                                fulfill();
                            });
                        }

                        function sendGoods() {
                            var http = Http();
                            return new Promise(function(fulfill, reject) {
                                http.post(game_notify_url, {
                                    uid: v.uid,
                                    orderId: orderId,
                                    shopid: v.shopid,
                                    time_start: v.time_start,
                                    time_end: data.time_end,
                                    trade_type: v.trade_type
                                }, function(err, sendResult) {
                                    if (err) {
                                        app.dbhelper.update("pay", {
                                            status: app.Common.ORDER_STATUS.errSend,
                                            transaction_id: data.transaction_id,
                                            err_code: data.err_code,
                                            err_code_des: "发货后端通知异常",
                                            time_end: data.time_end,
                                        }, { id: v.id }, function(er) {
                                            if (er) {
                                                res.wxpayxml({
                                                    return_code: "FAIL",
                                                    return_msg: "发货后端通知异常"
                                                }, mch_key);
                                                app.logger.error("订单通知 %j 发货后端通知异常,存储记录异常,err:", param, er.stack);
                                                reject();
                                                return;
                                            }
                                            res.wxpayxml({
                                                return_code: "FAIL",
                                                return_msg: "发货后端通知异常"
                                            }, mch_key);
                                            app.logger.error("订单通知 %j 发货后端通知异常,存储记录完成,err:", param, err.stack);
                                            reject();
                                        });
                                        return;
                                    }
                                    if (sendResult.code !== 0) {
                                        app.dbhelper.update("pay", {
                                            status: app.Common.ORDER_STATUS.errSend,
                                            transaction_id: data.transaction_id,
                                            err_code: data.err_code,
                                            err_code_des: "发货后端通知失败:" + sendResult.message,
                                            time_end: data.time_end,
                                        }, { id: v.id }, function(err) {
                                            if (err) {
                                                res.wxpayxml({
                                                    return_code: "FAIL",
                                                    return_msg: "发货后端通知失败"
                                                }, mch_key);
                                                app.logger.error("订单通知 %j 发货后端通知异常,存储记录异常,err:", param, err.stack);
                                                reject();
                                                return;
                                            }
                                            res.wxpayxml({
                                                return_code: "FAIL",
                                                return_msg: "发货后端通知失败"
                                            }, mch_key);
                                            app.logger.error("订单通知 %j 发货后端通知失败,存储记录完成 %j", param, sendResult);
                                            reject();
                                        });
                                        return;
                                    }
                                    fulfill();
                                });
                            });
                        }

                        function storeData() {
                            return new Promise(function(fulfill, reject) {
                                app.dbhelper.update("pay", {
                                    status: app.Common.ORDER_STATUS.done,
                                    transaction_id: data.transaction_id,
                                    err_code: data.err_code,
                                    err_code_des: data.err_code_des,
                                    time_end: data.time_end,
                                }, { id: v.id }, function(err) {
                                    if (err) {
                                        res.wxpayxml({
                                            return_code: "FAIL",
                                            return_msg: "存储失败"
                                        }, mch_key);
                                        app.logger.error("订单通知 %j 存储异常,err:", param, err.stack);
                                        reject();
                                        return;
                                    }
                                    res.wxpayxml({
                                        return_code: "SUCCESS",
                                        return_msg: "OK"
                                    }, mch_key);
                                    app.logger.info("订单通知 %j 处理完成", param);
                                    fulfill();
                                });
                            });
                        }
                        return check().then(function() { over(); });
                    });
                });
            }
        }
    }
};