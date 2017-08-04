var index = __filename.lastIndexOf("/");
if (index === -1) {
    index = __filename.lastIndexOf("\\");
}
var thisId = __filename.substr(index + 1, __filename.length - 3 - index - 1);
var moment = require("moment");

module.exports = function(app) {
    app.post("/getData/" + thisId, function(req, res) {
        var param = req.body;
        param.fcadmin = req.fcadmin;
        processReq(param, function(data) {
            res.json(data);
        });
    });

    function processReq(param, cb) {
        app.dbhelper.readSyscleMessage({}, [], [parseInt(param.start), parseInt(param.length)], function(err, datas) {
            if (err) {
                cb({
                    "draw": parseInt(param.draw),
                    "error": err.message
                });
                app.logger.error("%s 获取循环消息 数据异常,err:", param.fcadmin, data, err.stack);
                return;
            }
            var results = [];
            for (var i = 0; i < datas.length; i++) {
                var v = datas[i].dataValues;
                results.push({
                    id: v.id,
                    from: v.from,
                    to: v.to,
                    who: v.who,
                    channel: parseInt(v.channel),
                    content: v.content,
                    leavetime: moment(v.to).diff(moment(v.from), "seconds"),
                    status: v.status
                });
            }
            var data = {
                "draw": parseInt(param.draw),
                "recordsTotal": datas.length,
                "recordsFiltered": datas.length,
                "data": results
            };
            cb(data);
            app.logger.info("%s 获取循环消息 数据完成", param.fcadmin);
        })
    }
}