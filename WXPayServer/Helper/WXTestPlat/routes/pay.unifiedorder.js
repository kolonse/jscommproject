var ErrorCode = require("../../../Common/ErrorCode");
var CommonFunc = require("../../../Common/CommonFunction");
var HttpsClient = require("../../HttpsClient/httpsClient");
var Http = require("../../HttpClient/HttpClient");
var moment = require("moment");
module.exports = function(app) {
    /**
     * 注册游戏接口 get/post 均支持
     * query:
     */
    app.get("/pay/unifiedorder", function(req, res) {
        var param = req.query;
        processReq(param, function(data) {
            res.write(data);
            res.end();
        });
    });
    app.post("/pay/unifiedorder", function(req, res) {
        var param = req.body;
        processReq(param, function(data) {
            res.write(data);
            res.end();
        });
    });

    function processReq(param, cb) {
        console.log(param);
        var payAppId = param.xml.attach[0];
        var payApp = app.apps[payAppId];
        var mch_key = payApp.mch_key;
        var str = CommonFunc.getRandomStr();
        var data = {
            return_code: "SUCCESS",
            return_msg: "OK",
            nonce_str: str,
            result_code: "SUCCESS",
            device_info: "WEB-test",
            prepay_id: str
        };
        var wxdata = app.wxParse.toWXPayXml(data, mch_key);
        cb(wxdata);


        var url = param.xml.notify_url[0];
        var HttpClass = Http;
        if (/^https/.test(url)) {
            HttpClass = HttpsClient;
        }
        for (var i = 0; i < 1; i++) {
            send(i + 1);
        }

        function send(index) {
            setTimeout(function() {
                var data = {
                    return_code: "SUCCESS",
                    return_msg: "test",
                    appid: param.xml.appid[0],
                    mch_id: param.xml.mch_id[0],
                    device_info: param.xml.device_info ? param.xml.device_info[0] : "",
                    nonce_str: CommonFunc.getRandomStr(),
                    sign_type: "MD5",
                    result_code: "SUCCESS",
                    err_code: "0",
                    err_code_des: "test",
                    openid: param.xml.openid[0],
                    is_subscribe: "Y",
                    trade_type: payApp.trade_type,
                    bank_type: "CMC",
                    total_fee: parseInt(param.xml.total_fee[0]),
                    settlement_total_fee: parseInt(param.xml.total_fee[0]),
                    fee_type: "CNY",
                    cash_fee: parseInt(param.xml.total_fee[0]),
                    cash_fee_type: "CNY",
                    coupon_fee: 0,
                    coupon_count: 0,
                    coupon_type_0: 0,
                    coupon_id_0: 0,
                    coupon_fee_0: 0,
                    transaction_id: CommonFunc.getRandomStr(),
                    out_trade_no: param.xml.out_trade_no[0],
                    attach: param.xml.attach ? param.xml.attach[0] : "",
                    time_end: moment().format("YYYYMMDDHHmmss")
                };
                var wxdata1 = app.wxParse.toWXPayXml(data, mch_key);
                var http = HttpClass();
                http.post(url, wxdata1, "application/xml", function(err, result) {
                    console.log(err, result);
                });
            }, index * 2000);
        }
    }
};