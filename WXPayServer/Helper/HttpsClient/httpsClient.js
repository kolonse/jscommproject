/**
 * Created by Administrator on 2016/1/9.
 */

var https = require('https');
var BufferHelper = require("./BufferHelper.js");
var xml2js = require('xml2js');
var parseString = xml2js.parseString;

function HttpsRequest(opt) {
    opt = opt || {};
    this.rejectUnauthorized = opt.rejectUnauthorized;
    if (opt.rejectUnauthorized === null || opt.rejectUnauthorized === undefined) {
        this.rejectUnauthorized = true;
    }
}

HttpsRequest.prototype.get = function(url, param, cb) {
    var p = param;
    var existParam = true;
    if (param instanceof Function) {
        cb = param;
        p = {};
        existParam = false;
    }
    if (url[url.length - 1] !== "/") {
        url += "/";
    }
    var host = url.replace(/https:\/\/([^\/:]+).+/, "$1");
    var port = 443;
    if (/https:\/\/[^\/:]+:([^\/]+).+/.test(url)) {
        port = url.replace(/https?:\/\/[^\/:]+:([^\/]+).+/, "$1");
    }
    var path = "/";
    if (/https:\/\/[^\/]+(.+)/.test(url)) {
        path = url.replace(/https?:\/\/[^\/]+(.+)/, "$1");
    }

    var getData = require('querystring').stringify(p);
    var opt = {
        host: host || "localhost",
        port: port || 443,
        method: "GET",
        path: path || "/",
        rejectUnauthorized: this.rejectUnauthorized
    }

    if (existParam) {
        opt.path += "?" + getData;
    }
    var bufferHelper = new BufferHelper();
    var req = https.request(opt, function(res) {
        res.on('data', function(chunk) {
            bufferHelper.concat(chunk);
        }).on('end', function() {
            if (res.statusCode !== 200) {
                cb(new Error(bufferHelper.toBuffer().toString()));
            } else {
                // console.log(res.headers["content-type"]);
                if (/(text|application)\/json/.test(res.headers["content-type"])) {
                    var str = bufferHelper.toBuffer().toString();
                    var obj = null;
                    try {
                        obj = JSON.parse(str);
                        cb(null, obj);
                    } catch (err) {
                        cb(err, null);
                    }
                } else if (/(text|application)\/xml/.test(res.headers["content-type"])) {
                    parseString(bufferHelper.toBuffer().toString(), function(err, obj) {
                        cb(err, obj);
                    });
                } else {
                    // console.log(res.headers["content-type"]);
                    cb(null, bufferHelper.toBuffer().toString());
                }
            }
        }).on("error", function(error) {
            cb(error);
        });
    });
    req.on("error", function(error) {
        cb(error);
    });
    req.end();
};

HttpsRequest.prototype.post = function(url, data, contentType, cb) {
    if (contentType instanceof Function) {
        cb = contentType;
        contentType = 'application/json; charset=utf-8';
    }
    var postData = data;
    if (/\/json/.test(contentType)) {
        postData = JSON.stringify(data);
    }

    var host = url.replace(/https:\/\/([^\/:]+).+/, "$1");
    var port = 443;
    if (/https?:\/\/[^\/:]+:([^\/]+).+/.test(url)) {
        port = url.replace(/https?:\/\/[^\/:]+:([^\/]+).+/, "$1");
    }
    var path = "/";
    if (/https?:\/\/[^\/]+(.+)/.test(url)) {
        path = url.replace(/https?:\/\/[^\/]+(.+)/, "$1");
    }
    var options = {
        hostname: host,
        port: port,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': contentType,
            'Content-Length': Buffer.byteLength(postData, 'utf8')
        },
        rejectUnauthorized: this.rejectUnauthorized
    };
    var req = https.request(options, function(res) {
        res.setEncoding('utf8');
        var bufferHelper = new BufferHelper();
        res.on('data', function(chunk) {
            bufferHelper.concat(chunk);
        });
        res.on('end', function() {
            // console.log(res.headers["content-type"]);
            if (/(text|application)\/json/.test(res.headers["content-type"])) {
                var str = bufferHelper.toBuffer().toString();
                var obj = null;
                try {
                    obj = JSON.parse(str);
                    cb(null, obj);
                } catch (err) {
                    cb(err, null);
                }
            } else if (/(text|application)\/xml/.test(res.headers["content-type"])) {
                parseString(bufferHelper.toBuffer().toString(), function(err, obj) {
                    cb(err, obj);
                });
            } else {
                // console.log(res.headers["content-type"]);
                cb(null, bufferHelper.toBuffer().toString());
            }
        });
    });
    req.on('error', function(e) {
        cb(e);
    });
    req.write(postData);
    req.end();
};

module.exports = function(opt) {
    return new HttpsRequest(opt);
};