var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var cors = require('cors');
var ErrorCode = require("./Common/ErrorCode");
var Config = require("./config/config.js");
var config = require("./Helper/ConfigLoader/ConfigLoader.js")(Config);
var DB = require("./Helper/DBHelper");
var DBManger = require("./Helper/DBManager/DBManager");
var dbinst = DBManger(config.get("db"));
var Promise = require("promise");
var logger = require('./logger.js');
var version = require("./Common/version.json");
var CommonFunction = require("./Common/CommonFunction.js");
var Common = require("./Common/Common.js");
var fs = require("fs");
var WXParse = require("wx-pay").wxParse;
var WXSig = require("wx-pay").wxSig;
// 获取一个 mch_key 
var url = "https://api.mch.weixin.qq.com/sandboxnew/pay/getsignkey";
var data = {
    mch_id: 1459706802,
    nonce_str: CommonFunction.getRandomStr(),
    sign_type: "MD5"
};
// var mch_id = config.get("WXPublicPay").mch_id;
var sig = WXSig({});
var xml2js = require('xml2js');
var builder = new xml2js.Builder();
data.sign = sig.RawSig(data, "5ouIH7Bqd075gbGo4wvz2na86K2jFph8");
var xml = builder.buildObject({
    xml: data
});
var Https = require("./Helper/HttpsClient/httpsClient.js");
var http = Https();
http.post(url, xml, "application/xml", function(err, data) {
    if (err) {
        logger.error("服务启动失败! 微信沙箱环境获取沙箱签名失败");
        return;
    }
    var parseString = xml2js.parseString;
    parseString(data, function(err, result) {
        if (err) {
            logger.error("服务启动失败! 微信沙箱环境获取沙箱签名失败,返回结果不可解析 %s", data);
            return;
        }
        if (result.xml.return_code[0] !== "SUCCESS") {
            logger.error("服务启动失败! 微信沙箱环境获取沙箱签名失败,返回结果错误 %j", result);
            return;
        }
        var key = result.xml.sandbox_signkey[0];
        console.log(key);
    });
});