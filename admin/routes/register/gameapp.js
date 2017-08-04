var index = __filename.lastIndexOf("/");
if (index === -1) {
    index = __filename.lastIndexOf("\\");
}
var thisId = __filename.substr(index + 1, __filename.length - 3 - index - 1);

var moment = require("moment");
var Promise = require("promise");

module.exports = function(app) {
    app.post("/register/" + thisId, function(req, res) {
        var param = req.body;
        param.fcadmin = req.fcadmin;
        processReq(param, function(data) {
            res.json(data);
        });
    });

    function processReq(param, cb) {
        var res = {
            code: 0,
            message: ""
        };
        // 检查数据正确性
        var data = {};
        data.id = app.CommonFunction.getRandomStr();
        data.appName = param.appName;
        data.gameId = param.gameId;
        if (param.callbackUrl[param.callbackUrl.length - 1] !== "/") {
            param.callbackUrl += "/";
        }
        data.callbackUrl = param.callbackUrl;
        // 对数据库进行插入操作
        app.dbhelper.createGameApp(data, function(err) {
            if (err) {
                res.code = app.ErrorCode.errorDBBase;
                res.message = err.message;
                process.nextTick(function() { cb(res); });
                app.logger.error("%s 创建 %j 数据异常,err:", param.fcadmin, data, err.stack);
                return;
            }
            res.data = data;
            process.nextTick(function() { cb(res); });
            app.logger.info("%s 创建 %j 数据成功", param.fcadmin, data);
            return;
        });
    }
};