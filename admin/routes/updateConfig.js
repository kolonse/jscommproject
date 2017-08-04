var moment = require("moment");
var Http = require("../Helper/HttpClient/HttpClient.js");

module.exports = function(app) {
    app.post("/updateConfig", function(req, res) {
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
        tellServer({
            res: res,
            param: param
        }, cb);
    }


    function tellServer(arg, cb) {
        var res = arg.res;
        var id = arg.param.id;
        var index = id.indexOf("/");
        if (index !== -1) {
            id = id.substr(index + 1);
        }
        var url = arg.param.currentGameAppUrl + id;
        var http = Http();
        http.post(url, arg.param.cfg, function(err, result) {
            if (err) {
                res.code = -1;
                res.message = err.message;
                process.nextTick(function() { cb(res); });
                app.logger.error("%s 修改 %s 配置失败,游戏服务器回调接口 %s 异常,err:", arg.param.fcadmin, arg.param.id, url, err.stack);
                return;
            }
            if (result.code === undefined) {
                res.code = app.ErrorCode.errorUpdateConfig;
                res.message = result;
                app.logger.error("%s 修改 %s 配置失败,游戏服务器回调接口 %s 失败,result:%j", arg.param.fcadmin, arg.param.id, url, result);
                process.nextTick(function() { cb(res); });
                return;
            }
            if (result.code !== 0) {
                res.code = app.ErrorCode.errorUpdateConfig;
                res.message = result.message;
                app.logger.error("%s 修改 %s 配置失败,游戏服务器回调接口 %s 失败,result:%j", arg.param.fcadmin, arg.param.id, url, result);
                process.nextTick(function() { cb(res); });
                return;
            }
            writeConfig(arg, cb);
        });
    }

    function writeConfig(arg, cb) {
        var res = arg.res;
        app.config.update("gameConfig", arg.param.id, arg.param.cfg);
        process.nextTick(function() { cb(res); });
        app.logger.info("%s 修改 %s 配置成功", arg.param.fcadmin, arg.param.id);
    }
};