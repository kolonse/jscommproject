var Promise = require("promise");
module.exports = function(app) {
    /**
     * 微信支付注册接口
     */

    app.get("/registerApp", function(req, res) {
        var param = req.query;
        processReq(param, res);
    });
    app.post("/registerApp", function(req, res) {
        var param = req.body;
        processReq(param, res);
    });

    function processReq(param, res) {
        var uniqueStr = "login" + app.CommonFunction.getRandomStr();
        var data = {
            uniqueStr: uniqueStr,
            appName: param.appName,
            appid: param.appid,
            secret: param.secret,
            type: param.type || 'APP',
            url: param.url || "https://api.weixin.qq.com/"
        };

        app.dbhelper.create("app", data, function(err) {
            if (err) {
                res.json({
                    code: app.ErrorCode.errorDBBase,
                    message: err.message
                });
                app.logger.error("注册应用 %j 异常,err:", param, err.stack);
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
                var resData = { loginAppId: rst[0].dataValues.id };
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