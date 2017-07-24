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
    var nonceExpireTime = app.config.get("nonceExpireTime");
    var shopinfo = app.config.get("shopinfo");

    var version = app.version;
    var SEQ = 0;

    function makeOrderId() {
        return moment().format("YYYYMMDDHHmmssSSS") + app.Console.sprintf("%05d%03d%07d", process.pid, version.BUILD_ID % 10000, SEQ++ % 1000000);
    }
    app.get("/api/submit", function(req, res) {
        var param = req.query;
        param.ip = req.headers['x-real-ip'] ? req.headers['x-real-ip'] : req.ip.replace(/::ffff:/, '');
        if (param.ip === "127.0.0.1") {
            param.ip = "36.7.151.35";
        }
        processReq(param, res);
    });
    app.post("/api/submit", function(req, res) {
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
        var loginserverUrl = payApp.loginserverUrl;
        var unfiedorder = payApp.unfiedorder;
        var appid = payApp.appid;
        var mch_id = payApp.mch_id;
        var mch_body = payApp.mch_body;
        var expire = payApp.expire;
        var notify_url = payApp.notify_url;
        var trade_type = payApp.trade_type;
        var mch_key = payApp.mch_key;

        var orderId = makeOrderId();
        var shopid = param.shopid;
        var price = shopinfo[shopid] ? shopinfo[shopid].price : 0;
        var time_start = moment().format("YYYYMMDDHHmmss");
        var time_expire = moment().add(expire, "minutes").format("YYYYMMDDHHmmss");
        var uid = param.uid;
        var openid = "";
        var leader = -1;
        var labourunionId = -1;
        price *= 100;
        if (!price || price <= 0) {
            res.json({
                code: app.ErrorCode.errorParamBase,
                message: "该商品已下架"
            });
            app.logger.error("订单请求 %j 处理失败,商品 id 错误", param);
            return;
        }

        readUser().then(getPrepayId).then(checkSign).then(storePreid)
            .catch(function(err) {
                res.json({
                    code: app.ErrorCode.errorLogicBase,
                    message: "系统异常,稍后重试"
                });
                app.logger.error("订单请求 %j 处理异常,err:", param, err.stack);
                return;
            });

        function readUser() {
            var http = Http();
            var attr = [
                ["openid_public", "openid"], "leader", "labourunionId"
            ];
            if (trade_type === "APP") {
                attr[0] = ["openid_phone", "openid"];
            }
            return new Promise(function(fulfill, reject) {
                http.post(loginserverUrl + "readUser", {
                    where: { id: uid },
                    attr: attr
                }, function(err, data) {
                    if (err) {
                        res.json({
                            code: app.ErrorCode.errorRemote,
                            message: "系统异常,稍后重试"
                        });
                        app.logger.error("订单请求 %j 处理异常,err:", param, err.stack);
                        return;
                    }
                    if (data.code || data.code === undefined) {
                        res.json({
                            code: app.ErrorCode.errorRemote,
                            message: "系统发生故障,稍后重试"
                        });
                        app.logger.error("订单请求 %j 处理失败 %j", param, data);
                        return;
                    }
                    if (data.data.length === 0) {
                        res.json({
                            code: app.ErrorCode.errorRemote,
                            message: "您的用户未进行创建,请重试"
                        });
                        app.logger.error("订单请求 %j 处理失败,用户不存在", param);
                        return;
                    }
                    app.logger.debug("获取用户信息结果:%j", data);
                    openid = data.data[0].openid;
                    leader = data.data[0].leader === null ? -1 : (isNaN(parseInt(data.data[0].leader)) ? -1 : parseInt(data.data[0].leader));
                    labourunionId = data.data[0].labourunionId === null ? -1 : (isNaN(parseInt(data.data[0].labourunionId)) ? -1 : parseInt(data.data[0].labourunionId));
                    if (leader === -1 || labourunionId === -1) {
                        res.json({
                            code: app.ErrorCode.errorLogicBase,
                            message: "您需要登录游戏绑定推广人"
                        });
                        app.logger.error("订单请求 %j 处理失败,需要先绑定推广人", param);
                        return;
                    }
                    fulfill();
                });
            });
        }

        function getPrepayId() {
            var data = {
                appid: appid,
                mch_id: mch_id,
                nonce_str: app.CommonFunction.getRandomStr(),
                body: mch_body,
                out_trade_no: orderId,
                total_fee: price,
                spbill_create_ip: param.ip,
                notify_url: notify_url,
                trade_type: trade_type,
                openid: openid,
                attach: param.payAppId
            };
            var wxdata = app.wxParse.toWXPayXml(data, mch_key);
            app.logger.debug("预付订单信息:%s", wxdata);
            return new Promise(function(fulfill, reject) {
                var http = Https({ rejectUnauthorized: false });
                http.post(unfiedorder, wxdata, "application/xml", function(err, data) {
                    if (err) {
                        res.json({
                            code: app.ErrorCode.errorRemote,
                            message: "微信支付服务异常,请稍后重试"
                        });
                        app.logger.error("订单请求 %j 预付请求异常,err:", param, err.stack);
                        return;
                    }
                    app.logger.debug("预付订单请求结果:%j", data);
                    parseString(data, function(err, result) {
                        if (err) {
                            res.json({
                                code: app.ErrorCode.errorRemote,
                                message: "微信支付服务异常,请稍后重试"
                            });
                            app.logger.error("订单请求 %j 预付请求异常,非合法xml内容,err:", param, err.stack);
                            return;
                        }

                        if (!result || !result.xml || result.xml.return_code[0] !== "SUCCESS") {
                            res.json({
                                code: app.ErrorCode.errorRemote,
                                message: "微信支付服务异常,请稍后重试"
                            });
                            app.logger.error("订单请求 %j 预付请求失败 %j", param, result);
                            return;
                        }
                        data = result.xml;
                        if (!data.result_code || data.result_code[0] !== "SUCCESS") {
                            res.json({
                                code: app.ErrorCode.errorRemote,
                                message: "微信支付失败,请稍后重试"
                            });
                            app.logger.error("订单请求 %j 预付请求失败 %j", param, data);
                            return;
                        }

                        var value = {};
                        for (var k in data) {
                            value[k] = data[k][0];
                        }
                        app.logger.debug("预付订单结果信息:%j %j", data, value);
                        fulfill(value);
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
                    res.json({
                        code: app.ErrorCode.errorLogicBase,
                        message: "签名错误,支付失败"
                    });
                    app.logger.error("订单请求 %j 校验签名失败 %j", param, data);
                    return;
                }
                fulfill(data);
            });
        }

        function storePreid(data) {
            // 存储订单信息
            var storeData = {
                uid: uid,
                orderId: orderId,
                mch_id: mch_id,
                device_info: data.device_info || "",
                shopid: shopid,
                ip: param.ip,
                trade_type: trade_type,
                time_start: time_start,
                time_expire: time_expire,
                price: price,
                status: app.Common.ORDER_STATUS.create,
                openid: openid,
                prepay_id: data.prepay_id,
                leader: leader,
                labourunionId: labourunionId,
                payAppId: param.payAppId
            };
            app.logger.debug("订单创建信息:%j", storeData);
            return new Promise(function(fulfill) {
                app.dbhelper.create("pay", storeData, function(err) {
                    if (err) {
                        res.json({
                            code: app.ErrorCode.errorDBBase,
                            message: "服务异常,请稍后重试"
                        });
                        app.logger.error("订单请求 %j 存储订单异常 %j,err:", param, storeData, err.stack);
                        return;
                    }
                    var htmlData = {};
                    if (trade_type === "JSAPI") {
                        htmlData = {
                            "appId": appid,
                            "timeStamp": Math.floor(new Date().getTime() / 1000),
                            "nonceStr": app.CommonFunction.getRandomStr(),
                            "package": "prepay_id=" + data.prepay_id,
                            "signType": "MD5"
                        };
                        htmlData.paySign = app.wxSig.RawSig(htmlData, mch_key);
                    } else {
                        htmlData = {
                            "appid": appid,
                            "partnerid": mch_id,
                            "prepayid": data.prepay_id,
                            "package": "Sign=WXPay",
                            "noncestr": app.CommonFunction.getRandomStr(),
                            "timestamp": Math.floor(new Date().getTime() / 1000)
                        };
                        htmlData.sign = app.wxSig.RawSig(htmlData, mch_key);
                    }

                    htmlData.orderId = orderId;
                    app.logger.debug("jsapi 数据信息:%j", htmlData);
                    res.json({
                        code: 0,
                        message: "",
                        data: htmlData
                    });
                    app.logger.info("订单请求 %j 创建订单完成", param);
                });
            });
        }
    }
};