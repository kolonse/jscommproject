var index = __filename.lastIndexOf("/");
if (index === -1) {
    index = __filename.lastIndexOf("\\");
}
var thisId = __filename.substr(index + 1, __filename.length - 3 - index - 1);

var moment = require("moment");
var Promise = require("promise");

var USERNAME_MAX_LENGTH = 20;
var WXACCOUNT_MAX_LENGTH = 50;
var PHONE_STAND_LENGTH = 11;
var UNIONMAXCOUNT_MAX = 999;
var SHARINGRATE_MAX = 100;
var REMARK_MAX_LENGTH = 200;
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
        var data = param.data;
        data.password = app.Common.DEFAULT_PASSWARD;
        data.unionmaxcount = parseInt(data.unionmaxcount);
        data.sharingrate = parseInt(data.sharingrate);
        // if (data.username.length > USERNAME_MAX_LENGTH || data.username.length <= 0) {
        //     res.code = app.ErrorCode.errorParamBase;
        //     res.message = "用户名 必须填写正确";
        //     process.nextTick(function() { cb(res); });
        //     app.logger.error("%s 提交 %j 数据失败", param.fcadmin, data);
        //     return;
        // }
        if (data.wxaccount.length > WXACCOUNT_MAX_LENGTH || data.wxaccount.length <= 0) {
            res.code = app.ErrorCode.errorParamBase;
            res.message = "微信号 必须填写正确";
            process.nextTick(function() { cb(res); });
            app.logger.error("%s 提交 %j 数据失败", param.fcadmin, data);
            return;
        }
        if (!/^\d{11}$/.test(data.phone)) {
            res.code = app.ErrorCode.errorParamBase;
            res.message = "手机号 必须填写正确";
            process.nextTick(function() { cb(res); });
            app.logger.error("%s 提交 %j 数据失败", param.fcadmin, data);
            return;
        }
        if (isNaN(data.unionmaxcount) || data.unionmaxcount > UNIONMAXCOUNT_MAX) {
            res.code = app.ErrorCode.errorParamBase;
            res.message = "工会数量最大 " + UNIONMAXCOUNT_MAX;
            process.nextTick(function() { cb(res); });
            app.logger.error("%s 提交 %j 数据失败", param.fcadmin, data);
            return;
        }
        if (isNaN(data.sharingrate) || data.sharingrate > SHARINGRATE_MAX) {
            res.code = app.ErrorCode.errorParamBase;
            res.message = "分成比率最大值 " + SHARINGRATE_MAX;
            process.nextTick(function() { cb(res); });
            app.logger.error("%s 提交 %j 数据失败", param.fcadmin, data);
            return;
        }
        if (data.remark.length > REMARK_MAX_LENGTH) {
            res.code = app.ErrorCode.errorParamBase;
            res.message = "备注内容不能超过 " + REMARK_MAX_LENGTH;
            process.nextTick(function() { cb(res); });
            app.logger.error("%s 提交 %j 数据失败", param.fcadmin, data);
            return;
        }
        data.openid = app.CommonFunction.getRandomStr();
        data.status = app.Common.PLAYER_STATUS.except;
        // 对数据库进行插入操作
        app.dbhelper.createProxy(data, function(err) {
            if (err) {
                res.code = app.ErrorCode.errorDBBase;
                res.message = err.message;
                process.nextTick(function() { cb(res); });
                app.logger.error("%s 提交 %j 数据异常,err:", param.fcadmin, data, err.stack);
                return;
            }

            app.dbhelper.read("proxy", { openid: data.openid }, ["id"], [0, 1], function(err, data) {
                if (err) {
                    res.code = app.ErrorCode.errorDBBase;
                    res.message = err.message;
                    process.nextTick(function() { cb(res); });
                    app.logger.error("%s 提交 %j 数据异常,err:", param.fcadmin, data, err.stack);
                    return;
                }

                if (!data || data.length === 0) {
                    res.code = app.ErrorCode.errorLogicBase;
                    res.message = "服务逻辑异常";
                    process.nextTick(function() { cb(res); });
                    app.logger.error("%s 提交 %j 数据失败,数据查询出错", param.fcadmin, data);
                    return;
                }


                var id = data[0].dataValues.id;
                var username = app.Common.PROXY_SUFFIX + id;
                app.dbhelper.update("proxy", { username: username, status: app.Common.PLAYER_STATUS.unfreeze }, { id: id }, function(err) {
                    if (err) {
                        res.code = app.ErrorCode.errorDBBase;
                        res.message = err.message;
                        process.nextTick(function() { cb(res); });
                        app.logger.error("%s 提交 %j 数据异常,err:", param.fcadmin, data, err.stack);
                        return;
                    }
                    process.nextTick(function() { cb(res); });
                    app.logger.info("%s 提交 %j 数据成功", param.fcadmin, data);
                });
            });
        });
    }
};