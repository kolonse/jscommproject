var moment = require("moment");
var Promise = require("promise");
var Http = require("../../Helper/HttpClient/HttpClient.js");
module.exports = function(app) {
    app.post("/getData/mongo/:table", function(req, res) {
        var param = req.body;
        param.fcadmin = req.fcadmin;
        param.table = req.params.table;
        processReq(param, function(data) {
            res.json(data);
        });
    });

    function processReq(param, cb) {
        var order = {};
        for (var i = 0; i < param.order.length; i++) {
            var obj = param.order[i];
            if (obj instanceof Object) {
                order[param.columns[parseInt(obj.column)].data] = obj.dir === "asc" ? 1 : -1;
            } else {
                order.push(obj);
            }
        }
        var attr = {};
        for (var i = 0; i < param.attr.length; i++) {
            attr[param.attr[i]] = 1;
        }
        var where = {};
        if (param.where instanceof String) {
            where = JSON.parse(param.where);
        }
        var http = Http();
        var cond = param.cond;
        var url = app.config.get("ghlogserver");

        function Count() {
            var http = Http();
            var url = app.config.get("ghlogserver");
            return new Promise(function(fulfill, reject) {
                http.post(url, {
                    event: param.table,
                    method: "count",
                    arg: [where]
                }, function(err, result) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (result.code !== 0) {
                        reject(new Error(result.message));
                        return;
                    }
                    fulfill(result.data);
                });
            });
        }

        function Read() {
            var http = Http();
            var url = app.config.get("ghlogserver");
            return new Promise(function(fulfill, reject) {
                http.post(url, {
                    event: param.table,
                    method: "find",
                    arg: [where, attr],
                    nextMethods: [{
                            method: "sort",
                            arg: [order]
                        }, {
                            method: "skip",
                            arg: [parseInt(param.start)]
                        },
                        {
                            method: "limit",
                            arg: [parseInt(param.length)]
                        },
                        {
                            method: "lean"
                        }
                    ]
                }, function(err, result) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (result.code !== 0) {
                        reject(new Error(result.message));
                        return;
                    }
                    fulfill(result.data);
                });
            });
        }

        var data = {
            "draw": parseInt(param.draw)
        };

        Count()
            .then(function(result) {
                data.recordsTotal = result;
                data.recordsFiltered = result;
                return Read();
            })
            .then(function(result) {
                data.data = result;
                app.logger.info("%s 获取 %s 数据完成", param.fcadmin, param.table);
                cb(data);
            })
            .catch(function(err) {
                app.logger.error("%s 获取 %s 数据异常,err:", param.fcadmin, param.table, err.stack);
                data.error = err.message;
                cb(data);
            });
    }
};