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
        getUnioncount().then(getPlayerCount).then(getTotalUsed).then(getTotalUsed).then(getTotalCharge)
            .then(function(result) {
                cb({
                    code: 0,
                    message: "",
                    data: result
                });
                app.logger.info("%s 获取代理 %s 详细数据完成", param.fcadmin, param.id);
            }).catch(function(err) {
                if (err) {
                    cb({
                        code: app.ErrorCode.errorRead,
                        message: err.message
                    });
                    app.logger.error("%s 获取代理 %s 详细数据异常,err:", param.fcadmin, param.id, err.stack);
                    return;
                }
            });

        function getUnioncount() {
            return new Promise(function(fulfill) {
                app.dbhelper.read("union", { proxyId: param.id }, ["id"], function(err, datas) {
                    if (err) {
                        cb({
                            code: app.ErrorCode.errorRead,
                            message: err.message
                        });
                        app.logger.error("%s 获取代理 %s 详细数据异常,err:", param.fcadmin, param.id, err.stack);
                        return;
                    }
                    var unionIds = [];
                    for (var i = 0; i < datas.length; i++) {
                        unionIds.push(datas[i].dataValues.id);
                    }
                    fulfill({
                        unioncount: unionIds.length,
                        unionIds: unionIds
                    });
                });
            });
        }

        function getPlayerCount(result) {
            return new Promise(function(fulfill) {
                if (result.unioncount === 0) {
                    result.playercount = 0;
                    fulfill(result);
                    return;
                }
                app.dbhelper.count("roles", { unionId: result.unionIds }, function(err, data) {
                    if (err) {
                        cb({
                            code: app.ErrorCode.errorRead,
                            message: err.message
                        });
                        app.logger.error("%s 获取代理 %s 详细数据异常,err:", param.fcadmin, param.id, err.stack);
                        return;
                    }
                    result.playercount = data;
                    fulfill(result);
                });
            });
        }

        function getTotalUsed(reuslt) {
            return new Promise(function(fulfill) {
                app.dbhelper.sum("proxycarduse", "count", { proxyId: param.id }, function(err, data) {
                    if (err) {
                        cb({
                            code: app.ErrorCode.errorRead,
                            message: err.message
                        });
                        app.logger.error("%s 获取代理 %s 详细数据异常,err:", param.fcadmin, param.id, err.stack);
                        return;
                    }
                    reuslt.totalused = data || 0;
                    fulfill(reuslt);
                });
            });
        }

        function getTotalCharge(reuslt) {
            return new Promise(function(fulfill) {
                app.dbhelper.sum("proxycharge", "money", { proxyId: param.id }, function(err, data) {
                    if (err) {
                        cb({
                            code: app.ErrorCode.errorRead,
                            message: err.message
                        });
                        app.logger.error("%s 获取代理 %s 详细数据异常,err:", param.fcadmin, param.id, err.stack);
                        return;
                    }
                    reuslt.totalcharge = data || 0;
                    fulfill(reuslt);
                });
            });
        }
    }
};