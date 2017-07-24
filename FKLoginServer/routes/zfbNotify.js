/**
 * Created by Administrator on 2015/9/22.
 */
var commonDef = require("../Common/CommonDefine.js");
var config = require("../config/config.js");
var errorCode = require("../Common/ErrorCode.js");
var conmmonFunc = require("../Common/CommonFunction.js");
var HttpClient = require("../Helper/HttpClient/HttpClient.js");
var util = require("util");
var merge = require('merge');
var Promise = require("promise");
var ParamCheck = require("../Helper/ParamCheck/ParamCheck.js");
var thisModule = "zfbNotify";
/**
 * 处理  submit 请求
 *
 * @param app
 */
module.exports = function(app){
    app.get("/zfbNotify",function(req,res,next){
        global.logger.info(req.query);
        res.end();
        next();
    });


    app.get("/zfbErrorNotify",function(req,res,next){
        global.logger.info(req.query);
        res.end();
        next();
    });
}

