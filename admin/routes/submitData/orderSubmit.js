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
        var id = app.CommonFunction.getRandomStr();
        var data = {
            id: id,
            uid: param.uid,
            reason: param.reason,
            shop: param.shopid,
            status: app.Common.ORDER_STATUS.success,
            admin: param.fcadmin
        };
        sendGoods().then(function() {
            app.dbhelper.createIssueorders(data, function(err) {
                if (err) {
                    res.code = app.ErrorCode.errorDBBase;
                    res.message = err.message;
                    process.nextTick(function() { cb(res); });
                    app.logger.error("%s 创建补单 %j 数据异常,err:", param.fcadmin, data, err.stack);
                    return;
                }
                process.nextTick(function() { cb(res); });
                app.logger.info("%s 创建补单 %j 数据成功", param.fcadmin, data);
                return;
            });
        });

        function sendGoods() {
            var url = param.currentGameAppUrl + "dealgoods";
            var http = Http();
            return new Promise(function(fulfill, reject) {
                http.post(url, {
                    uid: param.uid,
                    orderId: id,
                    shopid: param.shopid,
                    time_start: moment().format("YYYY-MM-DD HH:mm:ss"),
                    time_end: moment().format("YYYY-MM-DD HH:mm:ss"),
                    trade_type: "admin"
                }, function(err, sendResult) {
                    if (err) {
                        res.code = app.ErrorCode.errorRemoteCall;
                        res.message = err.message;
                        process.nextTick(function() { cb(res); });
                        app.logger.error("%s 创建补单 %j 数据异常,err:", param.fcadmin, data, err.stack);
                        return;
                    }
                    if (sendResult.code !== 0) {
                        res.code = app.ErrorCode.errorRemoteCall;
                        res.message = sendResult.message;
                        process.nextTick(function() { cb(res); });
                        app.logger.error("%s 创建补单 %j 失败,%j:", param.fcadmin, data, sendResult);
                        return;
                    }
                    fulfill();
                });
            });
        }
    }
};