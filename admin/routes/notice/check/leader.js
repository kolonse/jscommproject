var index = __filename.lastIndexOf("/");
if (index === -1) {
    index = __filename.lastIndexOf("\\");
}
var thisId = __filename.substr(index + 1, __filename.length - 3 - index - 1);

var moment = require("moment");
var Promise = require("promise");

module.exports = function(app) {
    app.post("/notice/:gameId/check/" + thisId, function(req, res) {
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
        app.dbhelper.readUnioner({ id: param.leader }, ["unionId"], function(err, data) {
            if (err) {
                res.code = app.ErrorCode.errorRead;
                res.message = err.message;
                app.logger.error("检查推荐人 %j 失败,读取数据库数据异常,err:", param, err.stack);
                process.nextTick(function() { cb(res); });
                return;
            }
            if (!data || data.length === 0) {
                res.code = app.ErrorCode.errorNotExist;
                res.message = "推荐人 id 不存在";
                app.logger.error("检查推荐人 %j 完成,但该推荐人不存在", param);
                process.nextTick(function() { cb(res); });
                return;
            }
            var unionId = data[0].dataValues.unionId;
            app.dbhelper.update("fkloginuser", { leader: param.leader, labourunionId: unionId }, { id: param.uid }, function(err) {
                if (err) {
                    res.code = app.ErrorCode.errorWrite;
                    res.message = err.message;
                    app.logger.error("更新推荐人 %j 失败,更新数据库数据异常,err:", param, err.stack);
                    process.nextTick(function() { cb(res); });
                    return;
                }
                res.data = {
                    unionId: unionId
                };
                process.nextTick(function() { cb(res); });
                app.logger.info("检查推荐人 %s 完成", param.leader);
            });
        });
    }
};