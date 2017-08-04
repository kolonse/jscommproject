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
            app.logger.info("%s 修改推荐人 %j 操作失败,未选中操作数据", param.fcadmin, data);
            return;
        }
        var uid = parseInt(data.extra.uid);
        data.extra.uid = uid;
        var leader = data.data.newleader;
        checkUnioner().then(function() {
            app.dbhelper.readUnioner({ id: leader }, ["unionId"], function(err, data) {
                if (err) {
                    res.code = app.ErrorCode.errorRead;
                    res.message = err.message;
                    app.logger.error("管理员 %s 修改用户 %s 的推荐人 %s 失败,读取数据库数据异常,err:", param.fcadmin, uid, leader, err.stack);
                    process.nextTick(function() { cb(res); });
                    return;
                }
                if (!data || data.length === 0) {
                    res.code = app.ErrorCode.errorNotExist;
                    res.message = "推荐人 id 不存在";
                    app.logger.error("管理员 %s 修改用户 %s 的推荐人 %s 失败,推荐人不存在", param.fcadmin, uid, leader);
                    process.nextTick(function() { cb(res); });
                    return;
                }
                remoteSave(param, data[0].dataValues, cb);
            });
        });
        // 玩家必须不能是其他工会的会长或者副会长  这快逻辑可以通过 checkUser 做,但是checkUser的表不是立即刷新
        function checkUnioner() {
            return new Promise(function(fulfill) {
                app.dbhelper.count("unioner", { playerGameId: uid }, function(err, count) {
                    if (err) {
                        res.code = app.ErrorCode.errorRead;
                        res.message = "读取玩家工会信息失败";
                        process.nextTick(function() {
                            cb(res);
                        });
                        app.logger.error("%s 修改用户 异常,err:", param.fcadmin, datas, err.stack);
                        return;
                    }
                    if (count !== 0) {
                        res.code = app.ErrorCode.errorParamBase;
                        res.message = "玩家已是会长/副会长,不能进行更改";
                        process.nextTick(function() {
                            cb(res);
                        });
                        app.logger.error("%s 修改用户 失败,%s 玩家已是会长/副会长,不能进行更改", param.fcadmin, param.data.playerGameId);
                        return;
                    }
                    fulfill();
                });
            });
        }
    }

    function remoteSave(param, data, cb) {
        var res = {
            code: 0,
            message: ""
        };
        var uid = parseInt(param.extra.uid);
        var leader = param.data.newleader;
        if (leader === param.data.leader) {
            res.code = -1;
            res.message = "新旧推荐人不能相同";
            process.nextTick(function() { cb(res); });
            app.logger.error("%s 修改用户 %s 推荐人 %s 操作失败,新旧推荐人不能相同", param.fcadmin, uid, leader, url, err.stack);
            return;
        }
        var url = param.currentGameAppUrl + "setpromoter";
        var http = Http();
        http.post(url, { uid: uid, leader: leader, unionId: data.unionId }, function(err, result) {
            if (err) {
                res.code = -1;
                res.message = "游戏服务器未开启,稍后重试";
                process.nextTick(function() { cb(res); });
                app.logger.error("%s 修改用户 %s 推荐人 %s 操作失败,游戏服务器回调接口 %s 异常,err:", param.fcadmin, uid, leader, url, err.stack);
                return;
            }
            if (result.code === undefined) {
                res.code = app.ErrorCode.errorRemoteCall;
                res.message = result;
                app.logger.error("%s 修改用户 %s 推荐人 %s 操作失败,游戏服务器回调接口 %s 失败,result:%j", param.fcadmin, uid, leader, url, result);
                process.nextTick(function() { cb(res); });
                return;
            }
            if (result.code !== 0) {
                res.code = app.ErrorCode.errorRemoteCall;
                res.message = result.message;
                app.logger.error("%s 修改用户 %s 推荐人 %s 操作失败,游戏服务器回调接口 %s 失败,result:%j", param.fcadmin, uid, leader, url, result);
                process.nextTick(function() { cb(res); });
                return;
            }

            resetLoginUser().then(function() {
                process.nextTick(function() { cb(res); });
                app.logger.info("%s 修改用户 %s 推荐人 %s 操作成功", param.fcadmin, uid, leader);
            });
        });

        function resetLoginUser() {
            return new Promise(function(fulfill) {
                app.dbhelper.update("fkloginuser", { leader: leader, labourunionId: data.unionId }, { id: uid }, function(err) {
                    if (err) {
                        res.code = app.ErrorCode.errorWrite;
                        res.message = err.message;
                        app.logger.error("%s 修改用户 %s 推荐人 %s 操作失败, 异常,err:", param.fcadmin, uid, leader, err.stack);
                        process.nextTick(function() { cb(res); });
                        return;
                    }
                    fulfill();
                });
            });
        }
    }
};