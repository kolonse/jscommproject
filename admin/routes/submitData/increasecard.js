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
        // 检查数据正确性
        var data = param;
        if (!data.extra) {
            res.code = app.ErrorCode.errorLogicBase;
            res.message = "需要选中要操作的数据";
            process.nextTick(function() { cb(res); });
            app.logger.error("%s 增加房卡 %j 操作失败,未选中操作数据", param.fcadmin, data);
            return;
        }
        if (isNaN(parseInt(data.data.addcardcount)) || parseInt(data.data.addcardcount) <= 0) {
            res.code = app.ErrorCode.errorLogicBase;
            res.message = "增加的房卡数量必须为大于0的有效值";
            process.nextTick(function() { cb(res); });
            app.logger.error("%s 减少房卡 %j 操作失败,增加的房卡数量必须为大于0的有效值", param.fcadmin, data);
            return;
        }
        var uid = parseInt(data.extra.uid);
        var url = param.currentGameAppUrl + thisId;
        var http = Http();
        http.post(url, { uid: uid, addcardcount: data.data.addcardcount }, function(err, result) {
            if (err) {
                res.code = -1;
                res.message = err.message;
                process.nextTick(function() { cb(res); });
                app.logger.error("%s 增加房卡 %j 操作失败,游戏服务器回调接口 %s 异常,err:", param.fcadmin, data, url, err.stack);
                return;
            }
            if (result.code === undefined) {
                res.code = app.ErrorCode.errorRemoteCall;
                res.message = result;
                app.logger.error("%s 增加房卡 %j 操作失败,游戏服务器回调接口 %s 失败,result:%j", param.fcadmin, data, url, result);
                process.nextTick(function() { cb(res); });
                return;
            }
            if (result.code !== 0) {
                res.code = app.ErrorCode.errorRemoteCall;
                res.message = result.message;
                app.logger.error("%s 增加房卡 %j 操作失败,游戏服务器回调接口 %s 失败,result:%j", param.fcadmin, data, url, result);
                process.nextTick(function() { cb(res); });
                return;
            }
            process.nextTick(function() { cb(res); });
            app.logger.info("%s 增加房卡 %j 操作成功", param.fcadmin, data);
            var log = {
                time: moment().format("YYYY-MM-DD HH:mm:ss"),
                suid: "管理员-" + param.fcadmin,
                sname: "管理员",
                ruid: "" + uid,
                rname: data.extra.name,
                count: data.data.addcardcount
            };
            app.dblogclient.sendMsg("giverecord", log, function(err) {
                if (err) {
                    app.logger.warn("存储日志失败 %j, err:", log, err.stack);
                }
            });
        });
    }
};