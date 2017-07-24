var ErrorCode = require("../../../Common/ErrorCode");
var CommonFunc = require("../../../Common/CommonFunction");
var HttpsClient = require("../../HttpsClient/httpsClient");
module.exports = function(app) {
    /**
     * 注册游戏接口 get/post 均支持
     * query:
     */
    app.get("/sns/userinfo", function(req, res) {
        var param = req.query;
        processReq(param, function(data) {
            res.json(data);
        });
    });
    app.post("/sns/userinfo", function(req, res) {
        var param = req.body;
        processReq(param, function(data) {
            res.json(data);
        });
    });

    function processReq(param, cb) {
        var res = {
            errcode: 0,
            errmsg: "",
            openid: param.openid,
            nickname: "",
            sex: 1,
            province: "",
            city: "",
            country: "",
            headimgurl: "https://ss0.bdstatic.com/94oJfD_bAAcT8t7mm9GUKT-xh_/timg?image&quality=100&size=b4000_4000&sec=1486691785&di=be8d5789348c9ba90887b9b121631b4f&src=http://v1.qzone.cc/avatar/201308/15/15/39/520c85bf69f07495.jpg!200x200.jpg",
            privilege: [

            ],
            unionid: param.openid,
			isanyone:true //表示游客
        };

        process.nextTick(function() { cb(res); });
    }
}