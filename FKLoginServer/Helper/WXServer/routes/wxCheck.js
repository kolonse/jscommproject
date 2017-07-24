var ErrorCode = require("../../../Common/ErrorCode");
var CommonFunc = require("../../../Common/CommonFunction");
var HttpsClient = require("../../HttpsClient/httpsClient");
var Promise = require("promise");
module.exports = function(app) {
    /**
     * 注册游戏接口 get/post 均支持
     * query:
     */
    app.get("/wxCheck", function(req, res) {
        var param = req.query;
        processReq(param, function(data) {
            res.json(data);
        });
    });
    app.post("/wxCheck", function(req, res) {
        var param = req.body;
        processReq(param, function(data) {
            res.json(data);
        });
    });

    function processReq(param, cb) {
        var res = {
            code: 0,
            message: ""
        };
        var access_token = param.access_token;
        var uid = param.uid;
        var system = param.system;
        var deviceId = param.deviceId;
        var loginAppId = param.loginAppId;
        var loginApp = app.apps[loginAppId];
        if (!loginApp) {
            res.code = ErrorCode.errorParamBase;
            res.message = "应用不存在";
            process.nextTick(function() { cb(res); });
            app.logger.error("验证 [%j] 失败,应用不存在", param);
            return;
        }
        // var ip = param.ip ;
        // var deviceId = param.deviceId ;
        if (!access_token || access_token.length === 0) {
            res.code = ErrorCode.errorAccessToken;
            res.message = "缺少 access_token";
            process.nextTick(function() { cb(res); });
            app.logger.error("验证 [%j] 异常,缺少 access_token", param);
            return;
        }
        if (!uid || uid.length === 0) {
            res.code = ErrorCode.errorUid;
            res.message = "缺少 uid";
            process.nextTick(function() { cb(res); });
            app.logger.error("验证 [%j] 异常,缺少 uid", param);
            return;
        }
        if (!system || system.length === 0) {
            res.code = ErrorCode.errorSystem;
            res.message = "缺少 system";
            process.nextTick(function() { cb(res); });
            app.logger.error("验证 [%j] 异常,缺少 system", param);
            return;
        }
        if (!deviceId || deviceId.length === 0) {
            res.code = ErrorCode.errorDeviceId;
            res.message = "缺少 deviceId";
            process.nextTick(function() { cb(res); });
            app.logger.error("验证 [%j] 异常,缺少 deviceId", param);
            return;
        }
        // 根据 uid 查询用户 openid
        // queryOpenid(param, res, cb);
        queryOpenid().then(tokenCacheRead).then(loadUserinfo)
            .then(function(data) {
                res.nickname = data.nickname;
                res.headimgurl = data.headimgurl;
                res.sex = data.sex;
                process.nextTick(function() { cb(res); });
                app.logger.info("验证 [%j] 完成", param);
            })
            .catch(function(err) {
                res.code = -1;
                res.message = "系统异常";
                process.nextTick(function() { cb(res); });
                app.logger.error("验证 [%j] 异常,err:", param, err.stack);
            });

        function queryOpenid() {
            return new Promise(function(fulfill) {
                app.dbhelper.getUserInfoById(param.uid, ["openid_phone", "openid_public", "deviceId", "system"], function(err, data) {
                    if (err) {
                        res.code = ErrorCode.errorQuery;
                        res.message = err.message;
                        process.nextTick(function() { cb(res); });
                        app.logger.error("验证 [%j] 异常,err:", param, err.stack);
                        return;
                    }
                    if (!data) {
                        res.code = ErrorCode.errorCheck;
                        res.message = "用户不存在";
                        process.nextTick(function() { cb(res); });
                        app.logger.error("验证 [%j] 失败,用户不存在", param);
                        return;
                    }
                    fulfill(data);
                });
            });
        }

        function tokenCacheRead(data) {
            if (!WXTypeDo[loginApp.type]) {
                return new Promise(function() {
                    if (err) {
                        res.code = ErrorCode.errorLogicBase;
                        res.message = "应用注册类型【type】不支持";
                        process.nextTick(function() { cb(res); });
                        app.logger.error("登录 [%j] 异常,应用注册类型【type】不支持", param);
                        return;
                    }
                });
            }

            return WXTypeDo[loginApp.type].tokenCacheRead(data);
        }

        function loadUserinfo(data) {
            return new Promise(function(fulfill) {
                var https = HttpsClient({
                    rejectUnauthorized: false
                });
                https.get(loginApp.url + "sns/userinfo", {
                    access_token: param.access_token,
                    openid: data.openid
                }, function(err, result) {
                    if (err) {
                        res.code = ErrorCode.errorLogin;
                        res.message = err.message;
                        process.nextTick(function() { cb(res); });
                        app.logger.error("验证时获取用户信息 [%j] 异常,err:", param, err.stack);
                        return;
                    }
                    if (result.errcode) {
                        res.code = ErrorCode.errorLogin;
                        res.message = result.errmsg;
                        process.nextTick(function() { cb(res); });
                        app.logger.error("验证时获取用户信息 [%j] 失败, result:%j", param, result);
                        return;
                    }
                    data.nickname = result.nickname;
                    if (result.isanyone) {
                        data.nickname = uid;
                    }
                    data.headimgurl = result.headimgurl;
                    data.sex = result.sex;
                    app.logger.debug("loadUserinfo ->%j", data);
                    fulfill(data);
                });
            });
        }

        function tokenCheck(data) {
            return new Promise(function(fulfill) {
                var https = HttpsClient({
                    rejectUnauthorized: false
                });
                https.get(loginApp.url + "sns/auth", {
                    access_token: param.access_token,
                    openid: data.openid
                }, function(err, result) {
                    app.logger.debug("tokenCheck ->result:%j err:", result, err);
                    if (err) {
                        res.code = ErrorCode.errorCheck;
                        res.message = err.message;
                        process.nextTick(function() { cb(res); });
                        app.logger.error("验证 [%j] 异常,err:", param, err.stack);
                        return;
                    }
                    if (result.errcode) {
                        res.code = ErrorCode.errorCheck;
                        res.message = result.errmsg;
                        process.nextTick(function() { cb(res); });
                        app.logger.error("验证 [%j] 失败, result:%j", param, result);
                        return;
                    }
                    fulfill(data);
                });
            });
        }
        var WXTypeDo = {
            JSAPI: {
                tokenCacheRead: function(data) {
                    data.openid = data.openid_public;
                    return tokenCheck(data);
                }
            },
            APP: {
                tokenRefresh: function(data) {
                    return new Promise(function(fulfill) {
                        var https = HttpsClient({
                            rejectUnauthorized: false
                        });
                        https.get(loginApp.url + "sns/oauth2/refresh_token", {
                            refresh_token: data.cacheValue.refresh_token,
                            appid: loginApp.appid,
                            grant_type: "refresh_token"
                        }, function(err, result) {
                            if (err) {
                                res.code = ErrorCode.errorCheck;
                                res.message = err.message;
                                process.nextTick(function() { cb(res); });
                                app.logger.error("刷新 token [%j] 异常,err:", param, err.stack);
                                return;
                            }
                            if (result.errcode) { // 这里只要出现刷新错误 那么就让用户进行重新登录
                                res.code = ErrorCode.errorCheck;
                                if (parseInt(result.errcode) === 42002) { // 42002 表示微信的 refresh_token 过期
                                    res.code = ErrorCode.errorExpired;
                                }
                                res.message = result.errmsg;
                                process.nextTick(function() { cb(res); });
                                app.logger.error("刷新 token [%j] 失败, result:%j", param, result);
                                return;
                            }
                            // 刷新成功
                            app.logger.debug("刷新 [%j] 成功,结果 [%j]", data.cacheValue, result);
                            data.cacheValue.access_token = result.access_token;
                            data.cacheValue.expires_in = result.expires_in;
                            data.cacheValue.refresh_token = result.refresh_token;
                            data.cacheValue.now = Math.floor(new Date().getTime() / 1000);
                            param.access_token = result.access_token;

                            tokenStore(param.uid, data.cacheValue, function(err) {
                                if (err) {
                                    app.logger.warn("用户 [%j] 存储缓存 token [%j] 异常,err:", param, opt.cacheValue, err.stack);
                                }
                                // loadUserinfo(opt, cb);
                                fulfill(data);
                            });
                        });
                    });
                },
                tokenCacheRead: function(data) {
                    data.openid = data.openid_phone;
                    return new Promise(function(fulfill) {
                        tokenRead(param.uid, function(err, value) {
                            app.logger.debug("用户 [%j] err:%j value:%j", param, err, value);
                            if (value) {
                                if (Math.floor(new Date().getTime() / 1000) - value.now > value.expires_in - app.token_min_expire) { // redis 存储的 token 过期
                                    // 刷新 token
                                    data.cacheValue = value;
                                    app.logger.debug("用户 [%j] 数据过期,进行刷新 token", param);
                                    return WXTypeDo.APP.tokenRefresh(data).then(fulfill);
                                } else { // token 未过期
                                    // 需要检查一下 缓存的 token 和传上来的 token 是否一致,不一致就需要用户重新走授权流程
                                    if (param.access_token === value.access_token) { // 如果一致就可以直接获取用户信息 不需要进行 token auth
                                        fulfill(data);
                                    } else { // 不一致 直接走入授权流程
                                        res.code = ErrorCode.errorExpired;
                                        res.message = "信息不一致,需要重新授权";
                                        process.nextTick(function() { cb(res); });
                                        app.logger.error("用户 token [%j] 与缓存 token [%j] 不一致,需要重新授权", param, value);
                                        return;
                                    }
                                }
                            } else { // 如果读取到的数据为空了 需要检查 err 是否为空,如果err为空,表示用户需要进行重新授权了,因为用户已经很长时间没有登录了
                                // ,服务器不会保存太长时间的流失用户数据
                                if (!err) {
                                    res.code = ErrorCode.errorExpired;
                                    res.message = "长时间未登录,需要重新授权";
                                    process.nextTick(function() { cb(res); });
                                    app.logger.error("用户 token [%j] 长时间未登录,需要重新授权", param);
                                    return;
                                }
                                // 如果出现 err,有可能是 redis 异常,这时直接对用户的 token 进行 check 即可.
                                app.logger.warn("用户 [%j] 读取缓存 token 异常,err:", param, err.stack);
                                return tokenCheck(data).then(fulfill);
                            }
                        });
                    });
                }
            }
        };
    }

    function tokenStore(uid, value, cb) {
        app.redis.set(app.token_prefix + uid, JSON.stringify(value), app.token_expire, cb);
    }

    function tokenRead(uid, cb) {
        app.redis.get(app.token_prefix + uid, function(err, data) {
            if (err) {
                cb(err, null);
                // app.logger.error("读取 redis 数据失败,err:",err.stack);
                return;
            }
            if (data) {
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    cb(null, null);
                    return;
                }
            }
            cb(null, data);
        });
    }
};