/**
 * Created by Administrator on 2016/1/9.
 */

var https = require('https');
var BufferHelper = require("./BufferHelper.js");

function HttpsRequest(opt) {
    opt = opt || {};
    this.rejectUnauthorized = opt.rejectUnauthorized ;
    if( opt.rejectUnauthorized === null || opt.rejectUnauthorized === undefined ){
        this.rejectUnauthorized = true;
    }
}

HttpsRequest.prototype.get =  function(url,param,cb){
    var p = param ;
    var existParam = true ;
    if( param instanceof Function ){
        cb = param;
        p = {};
        existParam = false ;
    }
    // if(url[url.length - 1] !== "/"){
    //     url += "/";
    // }
    var host = url.replace(/https:\/\/([^\/:]+).+/,"$1");
    var port = 443;
    if( /https:\/\/[^\/:]+:([^\/]+).+/.test(url)){
        port = url.replace(/https?:\/\/[^\/:]+:([^\/]+).+/,"$1");
    }
    var path = "/";
    if( /https:\/\/[^\/]+(.+)/.test(url)){
        path = url.replace(/https?:\/\/[^\/]+(.+)/,"$1");
    }

    var getData = require('querystring').stringify(p);
    var opt = {
        host:host || "localhost",
        port:port || 443,
        method:"GET",
        path:path || "/",
        rejectUnauthorized:this.rejectUnauthorized
    }

    if( existParam ){
        opt.path += "?" + getData ;
    }
    var bufferHelper = new BufferHelper();
    var req = https.request(opt, function (res) {
        res.on('data',function (chunk) {
            bufferHelper.concat(chunk);
        }).on('end',function () {
            if(res.statusCode !== 200 ){
                cb(new Error(bufferHelper.toBuffer().toString()));
            }else{
                if( /application\/json/.test(res.headers["content-type"])){
                    var str = bufferHelper.toBuffer().toString() ;
                    cb(null,JSON.parse(str));
                }else{
                    var str = bufferHelper.toBuffer().toString();
                    try {
                        var json = JSON.parse(str);
                        cb(null,json);
                    } catch (error) {
                        cb(null,str);
                    }
                }
            }
        }).on("error", function (error) {
            cb( error );
        });
    });
    req.on("error", function (error) {
        cb( error );
    });
    req.end();
}

module.exports = function(opt) {
    return new HttpsRequest(opt);
}



