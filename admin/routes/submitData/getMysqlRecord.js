var moment = require("moment");
var Promise = require("promise");
var Http = require("../../Helper/HttpClient/HttpClient.js");
module.exports = function(app) {
    app.post("/submitData/mysql/:table", function(req, res) {
        var param = req.body;
        var cond = JSON.parse(param.cond);
        for (var key in cond) {
            param[key] = cond[key];
        }
        param.fcadmin = req.fcadmin;
        param.table = req.params.table;
        processReq(param, function(data) {
            res.json(data);
        });
    });

    function processReq(param, cb) {
        var order = [];
        param.order = param.order || [];
        for (var i = 0; i < param.order.length; i++) {
            var obj = param.order[i];
            if (obj.length) {
                order.push(obj);
            } else {
                order.push([param.columns[parseInt(obj.column)].data, obj.dir]);
            }
        }
        app.dbhelper.read(param.table, param.where, param.attr, [parseInt(param.start), parseInt(param.length)], order, function(err, results) {
            if (err) {
                cb({
                    code: app.ErrorCode.errorRead,
                    message: err.message
                });
                app.logger.error("%s 获取 %s 数据异常,err:", param.fcadmin, param.table, err.stack);
                return;
            }
            cb({
                code: 0,
                message: "",
                data: results
            });
            app.logger.info("%s 获取 %s 数据完成", param.fcadmin, param.table);
        });
    }
};