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
        app.dbhelper.readProxy({}, [], [parseInt(param.start), parseInt(param.length)], function(err, datas) {
            if (err) {
                cb({
                    "draw": parseInt(param.draw),
                    "error": err.message
                });
                app.logger.error("%s 获取 代理 数据异常,err:", param.fcadmin, data, err.stack);
                return;
            }
            var results = [];
            for (var i = 0; i < datas.length; i++) {
                var v = datas[i].dataValues;
                results.push({
                    id: v.id,
                    username: v.username,
                    phone: v.phone,
                    wxaccount: v.wxaccount,
                    unionmaxcount: v.unionmaxcount,
                    unioncount: 0,
                    playercount: 0,
                    chargecount: 0,
                    cardcost: 0,
                    sharingrate: v.sharingrate || 0.0,
                    createAt: v.createdAt || "0000-00-00 00:00:00",
                    remark: v.remark || "",
                    status: v.status || "0"
                });
            }
            var data = {
                "draw": parseInt(param.draw),
                "recordsTotal": datas.length,
                "recordsFiltered": datas.length,
                "data": results
            };
            cb(data);
            app.logger.info("%s 获取代理 数据完成", param.fcadmin);
        });
    }
};