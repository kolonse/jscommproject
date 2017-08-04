var index = __filename.lastIndexOf("/");
if (index === -1) {
    index = __filename.lastIndexOf("\\");
}
var thisId = __filename.substr(index + 1, __filename.length - 3 - index - 1);

var moment = require("moment");
var Promise = require("promise");
var Http = require("../../Helper/HttpClient/HttpClient.js");
module.exports = function(app) {
    app.post("/submitData/" + thisId, function(req, res) {
        var param = req.body;
        param.fcadmin = req.fcadmin;
        processReq(param, function(data) {
            res.json(data);
        });

        function processReq(param, cb) {
            var res = {
                code: 0,
                message: ""
            };
            // 检查数据正确性
            var data = param;
            if (!data.extra) {
                res.code = app.ErrorCode.errorLogicBase;
                res.message = "需要选中要操作的数据";
                process.nextTick(function() { cb(res); });
                app.logger.error("%s 权限修改 %j 操作失败,未选中操作数据", param.fcadmin, data);
                return;
            }
            var id = parseInt(data.extra.id);
            if (isNaN(id)) {
                res.code = app.ErrorCode.errorLogicBase;
                res.message = "用户 id 非合法数字";
                process.nextTick(function() { cb(res); });
                app.logger.error("%s 权限修改 %j 操作失败,用户 id 非合法数字", param.fcadmin, data);
                return;
            }
            var auth = data.data || "";
            // 对数据库进行插入操作
            app.dbhelper.update("user", { powerdiy: auth }, { id: data.extra.id }, function(err) {
                if (err) {
                    res.code = -1;
                    res.message = err.message;
                    process.nextTick(function() { cb(res); });
                    app.logger.error("%s 权限修改 操作失败, 异常,err:", param.fcadmin, err.stack);
                    return;
                }
                req.updateauth({ username: data.extra.username, power: data.extra.power }, auth);
                process.nextTick(function() { cb(res); });
                app.logger.info("%s 权限修改 操作成功", param.fcadmin);
            });
        }
    });
};