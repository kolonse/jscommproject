var Https = require("../../Helper/HttpsClient/httpsClient.js");
var Http = require("../../Helper/HttpClient/HttpClient.js");
var moment = require("moment");
var Promise = require("promise");
var util = require("util");
var xml2js = require('xml2js');
var parseString = xml2js.parseString;

module.exports = function(app) {
    /**
     * 客户端支付请求接口 get/post 均支持
     * 客户端会发送支付请求 带有游戏的 appid,goodsid 字段
     * query:
     *  gappId
     *  goodsId
     */
    var shopinfo = app.config.get("shopinfo");
    var SEQ = 0;
    app.get("/api/query", function(req, res) {
        var param = req.query;
        param.ip = req.headers['x-real-ip'] ? req.headers['x-real-ip'] : req.ip.replace(/::ffff:/, '');
        if (param.ip === "127.0.0.1") {
            param.ip = "36.7.151.35";
        }
        processReq(param, res);
    });
    app.post("/api/query", function(req, res) {
        var param = req.body;
        if (param.ip === "127.0.0.1") {
            param.ip = "36.7.151.35";
        }
        param.ip = req.headers['x-real-ip'] ? req.headers['x-real-ip'] : req.ip.replace(/::ffff:/, '');
        processReq(param, res);
    });

    function processReq(param, res) {
        var payApp = app.apps[param.payAppId];
        if (!payApp) {
            res.json({
                code: app.ErrorCode.errorParamBase,
                message: "应用不存在"
            });
            app.logger.error("订单请求 %j 处理失败,应用不存在", param);
            return;
        }
        var orderquery = payApp.orderquery;
        var appid = payApp.appid;
        var mch_id = payApp.mch_id;
        var orderId = param.orderId;
        var mch_key = payApp.mch_key;
        getOrderData().then(queryOrder).then(response)
            .catch(function() {
                res.json({
                    code: app.ErrorCode.errorLogicBase,
                    message: "服务异常,订单暂时无法查询,稍后重试"
                });
                app.logger.error("查询订单 %s 异常,err:", orderId, err.stack);
                return;
            });

        function getOrderData() {
            return new Promise(function(fulfill) {
                app.dbhelper.read("pay", { orderId: orderId }, ["transaction_id"], function(err, data) {
                    if (err) {
                        res.json({
                            code: app.ErrorCode.errorDBBase,
                            message: "服务异常,订单暂时无法查询,稍后重试"
                        });
                        app.logger.error("查询订单 %s 异常,err:", orderId, err.stack);
                        return;
                    }
                    if (!data || data.length === 0) {
                        res.json({
                            code: app.ErrorCode.errorOrderNotExist,
                            message: "订单不存在"
                        });
                        app.logger.error("查询订单 %s 失败,订单不存在", orderId);
                        return;
                    }
                    data = data[0].dataValues;
                    if (!data.transaction_id || data.transaction_id.length === 0) {
                        res.json({
                            code: app.ErrorCode.errorTranidNull,
                            message: "微信尚未通知,稍后重试"
                        });
                        app.logger.error("查询订单 %s 失败,订单没有通知处理完成", orderId);
                        return;
                    }
                    fulfill(data);
                });
            });
        }

        function queryOrder(data) {
            var reqData = {
                appid: appid,
                mch_id: mch_id,
                transaction_id: data.transaction_id,
                out_trade_no: orderId,
                nonce_str: app.CommonFunction.getRandomStr()
            };
            var wxdata = app.wxParse.toWXPayXml(reqData, mch_key);
            return new Promise(function(fulfill, reject) {
                var http = Https({ rejectUnauthorized: false });
                http.post(orderquery, wxdata, "application/xml", function(err, data) {
                    if (err) {
                        res.json({
                            code: app.ErrorCode.errorRemote,
                            message: "微信支付服务异常,请稍后重试"
                        });
                        app.logger.error("订单查询 %s 异常,err:", orderId, err.stack);
                        return;
                    }
                    parseString(data, function(err, result) {
                        if (err) {
                            res.json({
                                code: app.ErrorCode.errorRemote,
                                message: "微信支付服务异常,请稍后重试"
                            });
                            app.logger.error("订单查询 %s 异常,非合法xml内容,err:", orderId, err.stack);
                            return;
                        }

                        if (!result || !result.xml || result.xml.return_code[0] !== "SUCCESS") {
                            res.json({
                                code: app.ErrorCode.errorRemote,
                                message: "微信支付服务异常,请稍后重试"
                            });
                            app.logger.error("订单查询 %s 失败 %j", orderId, result);
                            return;
                        }
                        data = result.xml;
                        if (!data.result_code || data.result_code[0] !== "SUCCESS") {
                            res.json({
                                code: app.ErrorCode.errorRemote,
                                message: data.err_code_des[0]
                            });
                            app.logger.error("订单查询 %s 失败 %j", orderId, data);
                            return;
                        }

                        var value = {};
                        for (var k in data) {
                            value[k] = data[k][0];
                        }
                        app.logger.debug("订单查询:%s %j", orderId, value);
                        fulfill(value);
                    });
                });
            });
        }
        // 响应数据
        function response(data) {
            res.json({
                code: 0,
                data: {
                    trade_state: data.trade_state
                }
            });
            app.logger.info("订单查询 %s 完成", orderId);
        }
    }
};