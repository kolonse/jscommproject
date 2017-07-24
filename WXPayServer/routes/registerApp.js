var Promise = require("promise");
var Http = require("../Helper/HttpClient/HttpClient.js");
module.exports = function(app) {
    /**
     * 微信支付注册接口
     */

    var shopinfo = app.config.get("shopinfo");
    app.get("/registerApp", function(req, res) {
        var param = req.query;
        processReq(param, res);
    });
    app.post("/registerApp", function(req, res) {
        var param = req.body;
        processReq(param, res);
    });

    function processReq(param, res) {
        var uniqueStr = "pay" + app.CommonFunction.getRandomStr();
        var data = {
            uniqueStr: uniqueStr,
            appName: param.appName,
            trade_type: param.trade_type,
            loginserverUrl: param.loginserverUrl,
            orderquery: param.orderquery,
            unfiedorder: param.unfiedorder,
            mch_id: param.mch_id,
            mch_body: param.mch_body,
            mch_key: param.mch_key,
            appid: param.appid,
            expire: param.expire,
            notify_url: param.notify_url || "https://wxpublic.youdianle.com.cn/pay/api/notify",
            game_notify_url: param.game_notify_url
        };

        var resData = { payAppId: -1 };
        if (data.trade_type === "JSAPI") {
            data.jsapi = param.jsapi || "pay.html";
            resData.do = "/do";
        }
        app.dbhelper.create("app", data, function(err) {
            if (err) {
                res.json({
                    code: app.ErrorCode.errorDBBase,
                    message: err.message
                });
                app.logger.info("注册应用 %j 异常,err:", param, err.stack);
                return;
            }
            app.dbhelper.read("app", { uniqueStr: uniqueStr }, ["id"], [0, 1], function(err, rst) {
                if (err) {
                    res.json({
                        code: app.ErrorCode.errorDBBase,
                        message: err.message
                    });
                    app.logger.error("注册应用 %j 异常,err:", param, err.stack);
                    app.dbhelper.delete("app", { uniqueStr: uniqueStr }, function(err) {
                        if (err) {
                            app.logger.warn("注册应用 %j 异常时,删除记录异常,err:", param, err.stack);
                        }
                    });
                    return;
                }
                resData.payAppId = rst[0].dataValues.id;
                res.json({
                    code: 0,
                    message: "",
                    data: resData
                });
                app.apps[rst[0].dataValues.id] = data;
                app.logger.info("注册应用 %j 完成", param);
            });
        });
    }
};