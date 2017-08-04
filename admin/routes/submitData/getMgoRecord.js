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
        var http = Http();
        var cond = param.cond;
        var url = app.config.get("ghlogserver");
        http.post(url, cond, function(err, data) {
            if (err) {
                cb({
                    code: app.ErrorCode.errorRemoteCall,
                    message: err.message
                });
                app.logger.error("%s 获取 %s 数据异常,err:", param.fcadmin, cond, err.stack);
                return;
            }
            cb(data);
            app.logger.info("%s 获取 %s 数据完成", param.fcadmin, cond);
        });
    }
};