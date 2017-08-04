var index = __filename.lastIndexOf("/");
if (index === -1) {
    index = __filename.lastIndexOf("\\");
}
var thisId = __filename.substr(index + 1, __filename.length - 3 - index - 1);

var moment = require("moment");
var Promise = require("promise");
var Http = require("../../Helper/HttpClient/HttpClient.js");

module.exports = function(app) {
    app.post("/getData/" + thisId, function(req, res) {
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
        var url = param.currentGameAppUrl + thisId;
        var http = Http();
        http.post(url, { id: param.start }, function(err, result) {
            if (err) {
                cb({
                    "draw": parseInt(param.draw),
                    "error": err.message
                });
                app.logger.error("%s 获取循环消息 数据异常,err:", param.fcadmin, err.stack);
                return;
            }
            cb({
                "draw": parseInt(param.draw),
                "recordsTotal": result.length,
                "recordsFiltered": result.length,
                "data": result.data
            });
            app.logger.info("%s 获取循环消息 数据完成", param.fcadmin);
        });
        // var data = {
        //     "draw": parseInt(param.draw),
        //     "recordsTotal": 5,
        //     "recordsFiltered": 5,
        //     "data": [{
        //             "uid": 0,
        //             "rule": 0,
        //             "roundCount": 0,
        //             "seatCount": 0,
        //             "bulletValue": 0,
        //             "bulletCount": 0,
        //             "seats": [1, 2],
        //             "state": 0
        //         },
        //         {
        //             "uid": 0,
        //             "rule": 0,
        //             "roundCount": 0,
        //             "seatCount": 0,
        //             "bulletValue": 0,
        //             "bulletCount": 0,
        //             "seats": [1, 2],
        //             "state": 0
        //         },
        //         {
        //             "uid": 0,
        //             "rule": 0,
        //             "roundCount": 0,
        //             "seatCount": 0,
        //             "bulletValue": 0,
        //             "bulletCount": 0,
        //             "seats": [1, 2],
        //             "state": 0
        //         },
        //         {
        //             "uid": 0,
        //             "rule": 0,
        //             "roundCount": 0,
        //             "seatCount": 0,
        //             "bulletValue": 0,
        //             "bulletCount": 0,
        //             "seats": [1, 2],
        //             "state": 0
        //         }
        //     ]
        // };
        // cb(data);
        // app.logger.info("%s 获取循环消息 数据完成", param.fcadmin);
    }
};