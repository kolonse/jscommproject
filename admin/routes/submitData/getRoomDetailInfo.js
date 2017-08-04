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
        var url = param.currentGameAppUrl + thisId;
        var http = Http();
        http.post(url, { uid: param.uid }, function(err, result) {
            if (err) {
                cb({
                    "draw": parseInt(param.draw),
                    "error": err.message
                });
                app.logger.error("%s 获取房间详细信息 数据异常,err:", param.fcadmin, err.stack);
                return;
            }
            cb(result);
            app.logger.info("%s 获取房间详细信息 数据完成", param.fcadmin);
        });
        // var data = {
        //     code: 0,
        //     message: "",
        //     data: [
        //         [0, 1, 2, 3],
        //         [0, 1, 2, 3]
        //     ]
        // };
        // cb(data);
        // app.logger.info("%s 获取房间详细信息 数据完成", param.fcadmin);
    }
};