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
        http.post(url, { uid: uid, type: parseInt(param.type) }, function(err, result) {
            if (err) {
                res.code = -1;
                res.message = err.message;
                process.nextTick(function() { cb(res); });
                app.logger.error("%s 解冻警报 %s 操作失败,游戏服务器回调接口 %s 异常,err:", param.fcadmin, uid, url, err.stack);
                return;
            }
            if (result.code === undefined) {
                res.code = app.ErrorCode.errorRemoteCall;
                res.message = result;
                app.logger.error("%s 解冻警报 %s 操作失败,游戏服务器回调接口 %s 失败,result:%j", param.fcadmin, uid, url, result);
                process.nextTick(function() { cb(res); });
                return;
            }
            if (result.code !== 0) {
                res.code = app.ErrorCode.errorRemoteCall;
                res.message = result.message;
                app.logger.error("%s 解冻警报 %s 操作失败,游戏服务器回调接口 %s 失败,result:%j", param.fcadmin, uid, url, result);
                process.nextTick(function() { cb(res); });
                return;
            }

            app.dbhelper.update("warnlog", { status: app.Common.WARN_STATUS.unlocked }, { id: parseInt(param.id) }, function(err) {
                if (err) {
                    res.code = app.ErrorCode.errorWrite;
                    res.message = err.message;
                    process.nextTick(function() { cb(res); });
                    app.logger.error("%s 解冻警报id:%s 通知游戏成功但是写数据库异常,err:", param.fcadmin, param.id, err.stack);
                    return;
                }
                process.nextTick(function() { cb(res); });
                app.logger.info("%s 解冻警报 操作成功", param.fcadmin);
            });
        });
    }
};