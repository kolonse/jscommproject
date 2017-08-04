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
        var uid = param.uid;
        if (uid === undefined || uid === null) {
            res.code = app.ErrorCode.errorNotExist;
            res.message = "玩家不存在";
            process.nextTick(function() { cb(res); });
            app.logger.info("%s 获取玩家 %s 失败,玩家不存在", param.fcadmin, uid);
            return;
        }
        app.dbhelper.read("roles", { uid: uid }, [], [0, 1], function(err, datas) {
            if (err) {
                res.code = app.ErrorCode.errorRemoteCall;
                res.message = err.message;
                process.nextTick(function() { cb(res); });
                app.logger.error("%s 获取玩家 %s 数据异常,err:", param.fcadmin, uid, err.stack);
                return;
            }
            if (datas.length === 0) {
                res.code = app.ErrorCode.errorNotExist;
                res.message = "玩家不存在";
                process.nextTick(function() { cb(res); });
                app.logger.info("%s 获取玩家 %s 失败,玩家不存在", param.fcadmin, uid);
                return;
            }

            res.data = datas[0];
            process.nextTick(function() { cb(res); });
            app.logger.info("%s 获取玩家 %j 数据成功", param.fcadmin, res.data);
        });
    }
};