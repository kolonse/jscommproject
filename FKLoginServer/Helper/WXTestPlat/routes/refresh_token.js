var ErrorCode = require("../../../Common/ErrorCode");
var CommonFunc = require("../../../Common/CommonFunction");
var HttpsClient = require("../../HttpsClient/httpsClient");
module.exports = function(app) {
    /**
     * 注册游戏接口 get/post 均支持
     * query:
     */
    app.get("/sns/oauth2/refresh_token", function(req, res) {
        var param = req.query;
        processReq(param, function(data) {
            res.json(data);
        });
    });
    app.post("/sns/oauth2/refresh_token", function(req, res) {
        var param = req.body;
        processReq(param, function(data) {
            res.json(data);
        });
    });

    function processReq(param, cb) {
        console.log(param);
        var res = {
            errcode: 0,
            errmsg: "",
            access_token: CommonFunc.getRandomStr(),
            expires_in: 7200,
            refresh_token: CommonFunc.getRandomStr()
        };

        process.nextTick(function() { cb(res); });
    }
}