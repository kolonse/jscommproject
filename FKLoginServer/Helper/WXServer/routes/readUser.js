var ErrorCode = require("../../../Common/ErrorCode");
var CommonFunc = require("../../../Common/CommonFunction");
var HttpsClient = require("../../HttpsClient/httpsClient");
module.exports = function(app) {
    /**
     * 注册游戏接口 get/post 均支持
     * query:
     */
    app.get("/readUser", function(req, res) {
        var param = req.query;
        processReq(param, function(data) {
            res.json(data);
        });
    });
    app.post("/readUser", function(req, res) {
        var param = req.body;
        processReq(param, function(data) {
            res.json(data);
        });
    });

    function processReq(param, cb) {
        var res = {
            code: 0,
            message: ""
        };
        app.dbhelper.getUsers(param.where, param.attr, function(err, data) {
            if (err) {
                res.code = app.ErrorCode.errorQuery;
                res.message = err.message;
                app.logger.error("获取用户信息失败 %j,err:", param, err.stack);
                process.nextTick(function() { cb(res); });
                return;
            }
            res.data = data;
            process.nextTick(function() { cb(res); });
            app.logger.info("获取用户信息 %j 完成", param);
        });
    }
};