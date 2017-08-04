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
        var cond = JSON.parse(param.cond);
        for (var key in cond) {
            param[key] = cond[key];
        }
        param.fcadmin = req.fcadmin;
        processReq(param, function(data) {
            res.json(data);
        });
    });

    function processReq(param, cb) {
        getPlayerCount().then(getTotalUsed).then(getTotalCharge).then(getUnionerGameId).then(getViceUnionerCount)
            .then(function(result) {
                cb({
                    code: 0,
                    message: "",
                    data: result
                });
                app.logger.info("%s 获取工会 %s 详细数据完成", param.fcadmin, param.id);
            }).catch(function(err) {
                if (err) {
                    cb({
                        code: app.ErrorCode.errorRead,
                        message: err.message
                    });
                    app.logger.error("%s 获取工会 %s 详细数据异常,err:", param.fcadmin, param.id, err.stack);
                    return;
                }
            });

        function getPlayerCount() {
            return new Promise(function(fulfill) {
                app.dbhelper.count("roles", { unionId: param.id + "" }, function(err, data) {
                    if (err) {
                        cb({
                            code: app.ErrorCode.errorRead,
                            message: err.message
                        });
                        app.logger.error("%s 获取工会 %s 详细数据异常,err:", param.fcadmin, param.id, err.stack);
                        return;
                    }
                    fulfill({
                        playercount: data || 0
                    });
                });
            });
        }

        function getTotalUsed(reuslt) {
            return new Promise(function(fulfill) {
                app.dbhelper.sum("unioncarduse", "count", { unionId: param.id }, function(err, data) {
                    if (err) {
                        cb({
                            code: app.ErrorCode.errorRead,
                            message: err.message
                        });
                        app.logger.error("%s 获取工会 %s 详细数据异常,err:", param.fcadmin, param.id, err.stack);
                        return;
                    }
                    reuslt.totalused = data || 0;
                    fulfill(reuslt);
                });
            });
        }

        function getTotalCharge(reuslt) {
            return new Promise(function(fulfill) {
                app.dbhelper.sum("unioncharge", "money", { unionId: param.id }, function(err, data) {
                    if (err) {
                        cb({
                            code: app.ErrorCode.errorRead,
                            message: err.message
                        });
                        app.logger.error("%s 获取工会 %s 详细数据异常,err:", param.fcadmin, param.id, err.stack);
                        return;
                    }
                    reuslt.totalcharge = data || 0;
                    fulfill(reuslt);
                });
            });
        }

        function getUnionerGameId(reuslt) {
            return new Promise(function(fulfill) {
                app.dbhelper.read("unioner", { unionId: param.id, type: app.Common.UNIONER_TYPE.unioner }, ["playerGameId"], function(err, data) {
                    if (err) {
                        cb({
                            code: app.ErrorCode.errorRead,
                            message: err.message
                        });
                        app.logger.error("%s 获取工会 %s 详细数据异常,err:", param.fcadmin, param.id, err.stack);
                        return;
                    }
                    if (data && data.length && data.length > 0) {
                        reuslt.unionerGameId = data[0].dataValues.playerGameId;

                    } else {
                        reuslt.unionerGameId = "";
                    }
                    fulfill(reuslt);
                });
            });
        }

        function getViceUnionerCount(reuslt) {
            return new Promise(function(fulfill) {
                app.dbhelper.count("unioner", { unionId: param.id, type: app.Common.UNIONER_TYPE.viceunioner }, function(err, data) {
                    if (err) {
                        cb({
                            code: app.ErrorCode.errorRead,
                            message: err.message
                        });
                        app.logger.error("%s 获取工会 %s 详细数据异常,err:", param.fcadmin, param.id, err.stack);
                        return;
                    }

                    reuslt.viceunionercount = data || 0;
                    fulfill(reuslt);
                });
            });
        }
    }
};