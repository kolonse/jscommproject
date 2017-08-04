var index = __filename.lastIndexOf("/");
if (index === -1) {
    index = __filename.lastIndexOf("\\");
}
var thisId = __filename.substr(index + 1, __filename.length - 3 - index - 1);
var moment = require("moment");

module.exports = function(app) {
    app.post("/getData/" + thisId, function(req, res) {
        var param = req.body;
        param.fcadmin = req.fcadmin;
        param.table = req.params.table;
        processReq(param, function(data) {
            res.json(data);
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
            app.dbhelper.count("user", { power: { "$gte": 1 } }, function(err, count) {
                if (err) {
                    cb({
                        "draw": parseInt(param.draw),
                        "error": err.message
                    });
                    app.logger.error("%s 获取 %s 数据条数异常,err:", param.fcadmin, param.table, err.stack);
                    return;
                }
                app.dbhelper.read("user", { power: { "$gte": 1 } }, ["id", "username", "status", "power", "powerdiy", "boss", "createdAt", "remark"], [parseInt(param.start), parseInt(param.length)], order, function(err, results) {
                    if (err) {
                        cb({
                            "draw": parseInt(param.draw),
                            "error": err.message
                        });
                        app.logger.error("%s 获取 %s 数据异常,err:", param.fcadmin, param.table, err.stack);
                        return;
                    }
                    for (var i = 0; i < results.length; i++) {
                        var power = req.readauth(results[i].dataValues.username);
                        results[i].dataValues.powersv = power.power;
                    }
                    var data = {
                        "draw": parseInt(param.draw),
                        "recordsTotal": count,
                        "recordsFiltered": count,
                        "data": results
                    };
                    cb(data);
                    app.logger.info("%s 获取 user 数据完成", param.fcadmin);
                });
            });
        }
    });
};