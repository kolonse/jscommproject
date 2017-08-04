var index = __filename.lastIndexOf("/");
if (index === -1) {
    index = __filename.lastIndexOf("\\");
}
var thisId = __filename.substr(index + 1, __filename.length - 3 - index - 1);

var moment = require("moment");
var Promise = require("promise");

module.exports = function(app) {
    app.post("/notice/" + thisId, function(req, res) {
        var param = req.body;
        processReq(param, function(data) {
            res.json(data);
        });
    });

    function processReq(param, cb) {
        var res = {
            code: -1,
            message: "请求 http(s)://host/notice/:gameId 地址是为了各个游戏服务器通知后台需要处理的接口," +
                "gameId 是用户在注册后台功能时生成该游戏的唯一标识,请确保该 id 的正确性,如果忘记联系管理员进行查询"
        };
        process.nextTick(function() { cb(res); });
    }
};