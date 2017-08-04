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
        // 检查数据正确性
        var data = param;
        if (!data.extra) {
            res.code = app.ErrorCode.errorLogicBase;
            res.message = "需要选中要操作的数据";
            process.nextTick(function() { cb(res); });
            app.logger.error("%s 调整分成 %j 操作失败,未选中操作数据", param.fcadmin, data);
            return;
        }

        var id = parseInt(data.extra.id);
        var sharingrate = parseInt(data.data.newsharingrate);
        if (isNaN(sharingrate) || sharingrate < 0 || sharingrate > 100) {
            res.code = app.ErrorCode.errorLogicBase;
            res.message = "分成比例需要合理0~100之间数字";
            process.nextTick(function() { cb(res); });
            app.logger.error("%s 调整分成 %j 操作失败,分成比例需要合理0~100之间数字", param.fcadmin, data);
            return;
        }
        // data.password = app.Common.DEFAULT_PASSWARD;
        // 对数据库进行插入操作
        app.dbhelper.updateProxy({ sharingrate: sharingrate }, { id: id }, function(err) {
            if (err) {
                res.code = app.ErrorCode.errorDBBase;
                res.message = err.message;
                process.nextTick(function() { cb(res); });
                app.logger.error("%s 调整分成 %j 数据异常,err:", param.fcadmin, data, err.stack);
                return;
            }
            process.nextTick(function() { cb(res); });
            app.logger.info("%s 调整分成 %j 数据成功", param.fcadmin, data);
            return;
        })
    }
}