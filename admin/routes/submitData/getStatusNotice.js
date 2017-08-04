var index = __filename.lastIndexOf("/");
if (index === -1) {
    index = __filename.lastIndexOf("\\");
}
var thisId = __filename.substr(index + 1, __filename.length - 3 - index - 1);

var moment = require("moment");
var Promise = require("promise");
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
        var rsp = {
            waringlog: false,
            qbackanalysis: false
        };
        readWarningStatus().then(readQbackanalysis).then(function() {
            res.data = rsp;
            cb(res);
            app.logger.debug("%s 获取游戏状态通知完成", param.fcadmin);
        });

        function readWarningStatus() {
            return new Promise(function(fulfill) {
                app.dbhelper.count("warnlog", { status: 0 }, function(err, count) {
                    if (err) {
                        res.code = app.ErrorCode.errorDBBase;
                        res.message = err.message;
                        process.nextTick(function() { cb(res); });
                        app.logger.error("%s 获取游戏状态通知 %j 数据异常,err:", param.fcadmin, err.stack);
                        return;
                    }
                    if (count !== 0) {
                        rsp.waringlog = true;
                    }
                    fulfill();
                });
            });
        }

        function readQbackanalysis() {
            return new Promise(function(fulfill) {
                app.dbhelper.count("feedback", { flag: 0 }, function(err, count) {
                    if (err) {
                        res.code = app.ErrorCode.errorDBBase;
                        res.message = err.message;
                        process.nextTick(function() { cb(res); });
                        app.logger.error("%s 获取游戏状态通知 %j 数据异常,err:", param.fcadmin, data, err.stack);
                        return;
                    }
                    if (count !== 0) {
                        rsp.qbackanalysis = true;
                    }
                    fulfill();
                });
            });
        }
    }
};