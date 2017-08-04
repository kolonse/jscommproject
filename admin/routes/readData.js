var moment = require("moment");
module.exports = function(app) {
    app.post("/readData", function(req, res) {
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
        readData({
            res: res,
            param: param
        }, cb)
    }

    function readData(arg, cb) {
        var res = arg.res;
        // app.config.update("gameConfig",arg.param.id,arg.param.cfg);
        app.dbhelper.readDataInfo({ id: arg.param.id }, ["data"], function(err, data) {
            if (err) {
                res.code = app.ErrorCode.errorRead;
                res.message = err.message;
                process.nextTick(function() { cb(res); });
                app.logger.error("%s 读取 %s 数据异常,err:", arg.param.fcadmin, arg.param.id, err);
                return;
            }
            if (!data) {
                res.data = {};
                process.nextTick(function() { cb(res); });
                app.logger.error("%j 读取 %j 数据完成", arg.param.fcadmin, arg.param.id);
                return;
            }
            try {
                res.data = JSON.parse(data);
            } catch (e) {
                res.data = {};
            }
            process.nextTick(function() { cb(res); });
            app.logger.info("%j 读取 %j 数据完成", arg.param.fcadmin, arg.param.id);
        });
    }
}