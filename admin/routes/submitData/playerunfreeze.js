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
            app.logger.error("%s 解冻玩家 %j 操作失败,未选中操作数据", param.fcadmin, data);
            return;
        }
        var uid = parseInt(data.extra.uid);
        if (isNaN(uid)) {
            res.code = app.ErrorCode.errorLogicBase;
            res.message = "用户 id 非合法数字";
            process.nextTick(function() { cb(res); });
            app.logger.error("%s 冻结玩家 %j 操作失败,用户 id 非合法数字", param.fcadmin, data);
            return;
        }
        // var wxaccount = data.data.wxaccount; 
        // var phone = data.data.phone;
        // var remark = data.data.remark;
        // data.password = app.Common.DEFAULT_PASSWARD;
        // 对数据库进行插入操作
        var url = param.currentGameAppUrl + "unfreeze";
        var http = Http();
        http.post(url, { uid: uid }, function(err, result) {
            if (err) {
                res.code = -1;
                res.message = err.message;
                process.nextTick(function() { cb(res); });
                app.logger.error("%s 解冻玩家 %s 操作失败,游戏服务器回调接口 %s 异常,err:", param.fcadmin, uid, url, err.stack);
                return;
            }
            if (result.code === undefined) {
                res.code = app.ErrorCode.errorRemoteCall;
                res.message = result;
                app.logger.error("%s 解冻玩家 %s 操作失败,游戏服务器回调接口 %s 失败,result:%j", param.fcadmin, uid, url, result);
                process.nextTick(function() { cb(res); });
                return;
            }
            if (result.code !== 0) {
                res.code = app.ErrorCode.errorRemoteCall;
                res.message = result.message;
                app.logger.error("%s 解冻玩家 %s 操作失败,游戏服务器回调接口 %s 失败,result:%j", param.fcadmin, uid, url, result);
                process.nextTick(function() { cb(res); });
                return;
            }
            process.nextTick(function() { cb(res); });
            app.logger.info("%s 解冻玩家 %j 操作成功", param.fcadmin, data);
        });
    }
};