var Promise = require("promise");
var Http = require("../Helper/HttpClient/HttpClient.js");
module.exports = function(app) {
    /**
     * 客户端支付请求接口 get/post 均支持
     * 客户端会发送支付请求 带有游戏的 appid,goodsid 字段
     * query:
     *  gappId
     *  goodsId
     */

    var shopinfo = app.config.get("shopinfo");
    app.get("/do", function(req, res) {
        var param = req.query;
        processReq(param, res);
    });
    app.post("/do", function(req, res) {
        var param = req.body;
        processReq(param, res);
    });

    function processReq(param, res) {
        var payAppId = param.payAppId;
        var payApp = app.apps[payAppId];
        if (!payApp) {
            res.render("error.html", { error: "应用不存在" });
            app.logger.error("请求异常,支付失败 %j 应用不存在", param);
            return;
        }
		var loginAppId = param.loginAppId;
        var loginserverUrl = payApp.loginserverUrl;
        var jsapiHtml = payApp.jsapi;
        getUid().then(readUserInfo)
            .catch(function(err) {
                res.render("error.html", { error: "服务异常 稍后重试" });
                app.logger.error("请求异常,支付失败 %j err:", param, err.stack);
                return;
            });

        function getUid() {
            var http = Http();
            var data = {
                ticket: param,
                deviceId: "webpay",
                system: "webpay",
                version: "webpay*",
				loginAppId:loginAppId
            };
            return new Promise(function(fulfill, reject) {
                http.post(loginserverUrl + "wxLogin", data, function(err, result) {
                    if (err) {
                        res.render("error.html", { error: "服务异常 稍后重试" });
                        app.logger.error("请求异常,支付失败 %j err:", param, err.stack);
                        return;
                    }
                    if (result.code) {
                        res.render("error.html", { error: "服务异常 稍后重试" });
                        app.logger.error("请求出错,支付失败 %j %j", param, result);
                        return;
                    }
                    // bind(data);
                    app.logger.debug("微信登录结果: %j", result);
                    fulfill(result);
                });
            });
        }

        function readUserInfo(user) {
            var data = {
                uid: user.uid,
                access_token: user.access_token,
                deviceId: "webpay",
                system: "webpay",
                version: "webpay*",
				loginAppId:loginAppId
            };
            var http = Http();
            return new Promise(function(fulfill, reject) {
                http.post(loginserverUrl + "wxCheck", data, function(err, result) {
                    if (err) {
                        // app.logger.error("检查推广人异常 %j err:", param, err.stack);
                        res.render("error.html", { error: "服务异常 稍后重试" });
                        app.logger.error("请求异常,支付失败 %j err:", param, err.stack);
                        return;
                    }
                    if (result.code) {
                        res.render("error.html", { error: "服务异常 稍后重试" });
                        app.logger.error("请求出错,支付失败 %j %j", param, result);
                        return;
                    }

                    app.logger.info("微信检查结果: %j", result);
                    result.shopinfo = shopinfo;
                    result.uid = user.uid;
                    result.payAppId = payAppId;
                    res.render(jsapiHtml, result);
                });
            });
        }
    }
};