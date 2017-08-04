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
    });

    function processReq(param, cb) {
        var res = {
            code: 0,
            message: ""
        };
        var url = param.currentGameAppUrl + thisId;
        var http = Http();
        var uid = parseInt(param.uid);
        app.dbhelper.update("warnlog", { status: app.Common.WARN_STATUS.ignore }, { id: parseInt(param.id) }, function(err) {
            if (err) {
                res.code = app.ErrorCode.errorWrite;
                res.message = err.message;
                process.nextTick(function() { cb(res); });
                app.logger.error("%s 忽略警报id:%s 通知游戏成功但是写数据库异常,err:", param.fcadmin, param.id, err.stack);
                return;
            }
            process.nextTick(function() { cb(res); });
            app.logger.info("%s 忽略警报 操作成功", param.fcadmin);
        });
    }
};