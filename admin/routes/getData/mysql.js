var moment = require("moment");

module.exports = function(app) {
    app.post("/getData/mysql/:table", function(req, res) {
        var param = req.body;
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
        app.dbhelper.count(param.table, param.where, function(err, count) {
            if (err) {
                cb({
                    "draw": parseInt(param.draw),
                    "error": err.message
                });
                app.logger.error("%s 获取 %s 数据条数异常,err:", param.fcadmin, param.table, err.stack);
                return;
            }
            app.dbhelper.read(param.table, param.where, param.attr, [parseInt(param.start), parseInt(param.length)], order, function(err, results) {
                if (err) {
                    cb({
                        "draw": parseInt(param.draw),
                        "error": err.message
                    });
                    app.logger.error("%s 获取 %s 数据异常,err:", param.fcadmin, param.table, err.stack);
                    return;
                }
                var data = {
                    "draw": parseInt(param.draw),
                    "recordsTotal": count,
                    "recordsFiltered": count,
                    "data": results
                };
                cb(data);
                app.logger.info("%s 获取 %s 数据完成", param.fcadmin, param.table);
            });
        });
    }
};