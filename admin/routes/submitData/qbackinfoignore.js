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
        var uid = parseInt(param.uid);
        app.dbhelper.update("feedback", { flag: app.Common.FEEDBACK_STATUS.ignore }, { id: param.id }, function(err) {
            if (err) {
                res.code = app.ErrorCode.errorWrite;
                res.message = err.message;
                process.nextTick(function() { cb(res); });
                app.logger.error("%s 客诉忽略:%s 通知游戏成功但是写数据库异常,err:", param.fcadmin, param.id, err.stack);
                return;
            }
            process.nextTick(function() { cb(res); });
            app.logger.info("%s 客诉忽略 操作成功", param.fcadmin);
        });
    }
};