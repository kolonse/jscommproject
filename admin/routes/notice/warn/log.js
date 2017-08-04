var index = __filename.lastIndexOf("/");
if (index === -1) {
    index = __filename.lastIndexOf("\\");
}
var thisId = __filename.substr(index + 1, __filename.length - 3 - index - 1);

var moment = require("moment");
var Promise = require("promise");

module.exports = function(app) {
    app.post("/notice/:gameId/warn/" + thisId, function(req, res) {
        var param = req.body;
        processReq(param, function(data) {
            res.json(data);
        });
    });

    function processReq(param, cb) {
        var res = {
            code: 0,
            message: ""
        };

        app.dbhelper.create("warnlog", param, function(err) {
            if (err) {
                res.code = app.ErrorCode.errorRead;
                res.message = err.message;
                app.logger.error("警报日志存储 %j 失败,err:", param, err.stack);
                process.nextTick(function() { cb(res); });
                return;
            }
            app.logger.info("警报日志存储 %j 完成", param);
        });
    }
};