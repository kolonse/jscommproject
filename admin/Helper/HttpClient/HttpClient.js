/**
 * Created by Administrator on 2015/7/30.
 */

var http = require('http');
var BufferHelper = require("./BufferHelper.js");

function HttpRequest() {}

HttpRequest.prototype.getUrl = function(url, param, cb) {
    var p = param;
    var existParam = true;
    if (param instanceof Function) {
        cb = param;
        p = {};
        existParam = false;
    }
    var host = url.replace(/https?:\/\/([^\/:]+).+/, "$1");
    var port = 80;
    if (/https?:\/\/[^\/:]+:([^\/]+).+/.test(url)) {
        port = url.replace(/https?:\/\/[^\/:]+:([^\/]+).+/, "$1");
    }
    var path = "/";
    if (/https?:\/\/[^\/]+(.+)/.test(url)) {
        path = url.replace(/https?:\/\/[^\/]+(.+)/, "$1");
    }

    var getData = require('querystring').stringify(p);
    var opt = {
        host: host || "localhost",
        port: port || 80,
        method: "GET",
        path: path || "/",
        agent: false
    }

    if (existParam) {
        opt.path += "?" + getData;
    }

    var bufferHelper = new BufferHelper();
    var req = http.request(opt, function(res) {
        res.on('data', function(chunk) {
            bufferHelper.concat(chunk);
        }).on('end', function() {
            if (res.statusCode !== 200) {
                cb(new Error(bufferHelper.toBuffer().toString()));
            } else {
                if (/application\/json/.test(res.headers["content-type"])) {
                    var str = bufferHelper.toBuffer().toString();
                    cb(null, JSON.parse(str));
                } else {
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
}

HttpRequest.prototype.post = function(url, data, cb) {
    var postData = JSON.stringify(data);

    var host = url.replace(/https?:\/\/([^\/:]+).+/, "$1");
    var port = 80;
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
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': Buffer.byteLength(postData, 'utf8')
        }
    };
    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        var bufferHelper = new BufferHelper();
        res.on('data', function(chunk) {
            bufferHelper.concat(chunk);
        });
        res.on('end', function() {
            if (/application\/json/.test(res.headers["content-type"])) {
                var str = bufferHelper.toString();
                var ret = {};
                try {
                    ret = JSON.parse(str);
                } catch (e) {
                    console.error(e);
                }
                cb(null, ret);
            } else {
                cb(null, bufferHelper.toString());
            }
        })
    });
    req.on('error', function(e) {
        cb(e);
    });
    req.write(postData);
    req.end();
};

HttpRequest.prototype.post = function(url, data, contentType, cb) {
    if (contentType instanceof Function) {
        cb = contentType;
        contentType = 'application/json; charset=utf-8';
    }
    var postData = data;
    // if (/\/json/.test(contentType)) {
    //     postData = JSON.stringify(data);
    // }
    if (data instanceof Object) {
        postData = JSON.stringify(data);
    } else {
        postData = data;
    }
    var host = url.replace(/https?:\/\/([^\/:]+).+/, "$1");
    var port = 80;
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
            'Content-Type': contentType, //'application/json; charset=utf-8',
            'Content-Length': Buffer.byteLength(postData, 'utf8')
        }
    };
    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        var bufferHelper = new BufferHelper();
        res.on('data', function(chunk) {
            bufferHelper.concat(chunk);
        });
        res.on('end', function() {
            if (/application\/json/.test(res.headers["content-type"])) {
                var str = bufferHelper.toString();
                var ret = {};
                try {
                    ret = JSON.parse(str);
                } catch (e) {
                    console.error(e);
                }
                cb(null, ret);
            } else {
                cb(null, bufferHelper.toString());
            }
        })
    });
    req.on('error', function(e) {
        cb(e);
    });
    req.write(postData);
    req.end();
};
/**
 * 发送请求接口
 *
 * @param option  格式:
 *
 * @param callback(err,result)
 */
HttpRequest.prototype.formPostRequest = function(option, callback) {
    var postData = require('querystring').stringify(option.data);
    var opt = {
        host: option.host || "localhost",
        port: option.port || 80,
        method: "POST",
        path: option.path || "/",
        agent: false,
        timeout: option.timeout || 60000,
        connectTimeout: option.connectTimeout || 30000,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": Buffer.byteLength(postData)
        }
    }

    if (option.timeout === 0) {
        opt.timeout = 0;
    }
    if (option.connectTimeout === 0) {
        opt.connectTimeout = 0;
    }

    var req = null;
    var responseComing = false;
    var bufferHelper = new BufferHelper();
    var connectTimeout = false;
    var connect_timer = setTimeout(function() {
        if (responseComing === true) { // 如果响应正在回来了 就不用管超时逻辑了
            return;
        }
        // 如果响应没有回来 但是现在超时了 那么可以销毁 req 对象了 主要为了应对服务器不给响应的场景
        connectTimeout = true;
        if (req != null) {
            req.destroy();
        } else {
            callback(new Error("connect timeout"));
        }
    }, opt.connectTimeout);

    if (connectTimeout === true) {
        return;
    }
    req = http.request(opt, function(res) {
        responseComing = true; // 如果响应来了 那么修改响应状态
        if (connectTimeout === true) {
            res.destroy();
            callback(new Error("response timeout"));
            return;
        } else {
            clearTimeout(connect_timer);
        }
        //等待响应N秒超时
        var response_timer = setTimeout(function() {
            res.destroy();
            callback(new Error("response timeout"));
        }, opt.timeout);
        res.on('data', function(chunk) {
            bufferHelper.concat(chunk);
        }).on('end', function() {
            clearTimeout(response_timer);
            if (res.statusCode !== 200) {
                callback(new Error(bufferHelper.toBuffer().toString()))
            } else {
                callback(null, bufferHelper.toBuffer().toString());
            }
        }).on("error", function(error) {
            callback(error);
        });
    });
    req.on("error", function(error) {
        callback(error);
    });
    req.write(postData + '\n');
    req.end();
}

HttpRequest.prototype.get = function(option, callback) {
    var getData = require('querystring').stringify(option.data);
    var opt = {
        host: option.host || "localhost",
        port: option.port || 80,
        method: "GET",
        path: option.path || "/",
        agent: false,
        timeout: option.timeout || 60000,
        connectTimeout: option.connectTimeout || 30000
    }

    if (option.data) {
        opt.path += "?" + getData;
    }

    if (option.timeout === 0) {
        opt.timeout = 0;
    }
    if (option.connectTimeout === 0) {
        opt.connectTimeout = 0;
    }

    var req = null;
    var responseComing = false;
    var bufferHelper = new BufferHelper();
    var connectTimeout = false;
    var connect_timer = setTimeout(function() {
        if (responseComing === true) { // 如果响应正在回来了 就不用管超时逻辑了
            return;
        }
        // 如果响应没有回来 但是现在超时了 那么可以销毁 req 对象了 主要为了应对服务器不给响应的场景
        connectTimeout = true;
        if (req != null) {
            req.destroy();
        } else {
            callback(new Error("connect timeout"));
        }
    }, opt.connectTimeout);

    if (connectTimeout === true) {
        return;
    }
    req = http.request(opt, function(res) {
        responseComing = true; // 如果响应来了 那么修改响应状态
        if (connectTimeout === true) {
            res.destroy();
            callback(new Error("response timeout"));
            return;
        } else {
            clearTimeout(connect_timer);
        }
        //等待响应N秒超时
        var response_timer = setTimeout(function() {
            res.destroy();
            callback(new Error("response timeout"));
        }, opt.timeout);
        res.on('data', function(chunk) {
            bufferHelper.concat(chunk);
        }).on('end', function() {
            clearTimeout(response_timer);
            if (res.statusCode !== 200) {
                callback(new Error(bufferHelper.toBuffer().toString()))
            } else {
                callback(null, bufferHelper.toBuffer().toString());
            }
        }).on("error", function(error) {
            callback(error);
        });
    });
    req.on("error", function(error) {
        callback(error);
    });
    req.end();
}
module.exports = function() {
    return new HttpRequest();
}