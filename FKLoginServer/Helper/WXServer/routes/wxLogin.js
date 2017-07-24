var ErrorCode = require("../../../Common/ErrorCode");
var CommonFunc = require("../../../Common/CommonFunction");
var HttpsClient = require("../../HttpsClient/httpsClient");
var HttpClient = require("../../HttpClient/HttpClient");
var Promise = require("promise");
module.exports = function(app) {
    /**
     * 注册游戏接口 get/post 均支持
     * query:
     */
    app.get("/wxLogin", function(req, res) {
        var param = req.query;
        processReq(param, function(data) {
            res.json(data);
        });
    });
    app.post("/wxLogin", function(req, res) {
        var param = req.body;
        processReq(param, function(data) {
            res.json(data);
        });
    });

    function processReq(param, cb) {
        app.logger.debug("process [%j]", param);
        var res = {
            code: 0,
            message: ""
        };
        // 票据 由微信返回  客户端登陆时需要将该票据传输过来
        /**
         * ticket 格式
         * ticket:{
         *  ErrCode:xx,
         *  code:xx,
         *  state:xx,
         *  lang:xx,
         *  country:xx
         * }
         */
        var ticket = param.ticket;
        if (typeof(ticket) === "string") {
            try {
                ticket = JSON.parse(ticket);
                param.ticket = ticket;
            } catch (e) {
                res.code = ErrorCode.errorTicket;
                res.message = "ticket 如果是 string 那么必须为 json 格式";
                process.nextTick(function() { cb(res); });
                return;
            }
        }
        var deviceId = param.deviceId;
        // 系统类型 例如 IOS6.0 eg.
        var system = param.system;
        // 客户端版本号
        var version = param.version;
        var loginAppId = param.loginAppId;
        var loginApp = app.apps[loginAppId];
        if (!loginApp) {
            res.code = ErrorCode.errorParamBase;
            res.message = "应用不存在";
            process.nextTick(function() { cb(res); });
            app.logger.error("验证 [%j] 失败,应用不存在", param);
            return;
        }
        if (!ticket) {
            res.code = ErrorCode.errorTicket;
            res.message = "缺少 ticket";
            process.nextTick(function() { cb(res); });
            return;
        }
        if (!deviceId || deviceId.length === 0) {
            res.code = ErrorCode.errorDeviceId;
            res.message = "缺少 deviceId";
            process.nextTick(function() { cb(res); });
            return;
        }
        if (!system || system.length === 0) {
            res.code = ErrorCode.errorSystem;
            res.message = "缺少 system";
            process.nextTick(function() { cb(res); });
            return;
        }
        if (!version || version.length === 0) {
            res.code = ErrorCode.errorVersion;
            res.message = "缺少 version";
            process.nextTick(function() { cb(res); });
            return;
        }
        var wxUrl = loginApp.url;
        var appid = loginApp.appid;
        var secret = loginApp.secret;
        var https = HttpsClient({
            rejectUnauthorized: false
        });
        if (wxUrl.substr(0, 5) === "http:") {
            https = HttpClient();
        }
        getToken().then(getUserInfo).then(userExistDo, userNExistDo).then(function(data) {
            res.access_token = data.token.access_token;
            res.uid = data.userinfo.uid;
            process.nextTick(function() { cb(res); });
            app.logger.info("用户 %s 登录 [%j] 完成", data.userinfo.id, param);
        }).catch(function(err) {
            res.code = -1;
            res.message = "系统异常";
            process.nextTick(function() { cb(res); });
            app.logger.error("用户登录 [%j] 异常,err:", param, err.stack);
        });

        function getToken() {
            return new Promise(function(fulfill) {
                https.get(wxUrl + "sns/oauth2/access_token", {
                    appid: appid,
                    secret: secret,
                    code: ticket.code,
                    grant_type: "authorization_code"
                }, function(err, result) {
                    if (err) {
                        res.code = ErrorCode.errorLogin;
                        res.message = err.message;
                        process.nextTick(function() { cb(res); });
                        app.logger.error("登录 [%j] 异常,err:", param, err.stack);
                        return;
                    }
                    if (result.errcode) {
                        res.code = ErrorCode.errorLogin;
                        res.message = result.errmsg;
                        process.nextTick(function() { cb(res); });
                        app.logger.error("登录 [%j] 失败, result:%j", param, result);
                        return;
                    }

                    fulfill(result);
                });
            });
        }

        function getUserInfo(token) {
            return new Promise(function(existdo, notexistdo) {
                app.dbhelper.getUserInfoBy({ unionid: token.unionid }, ['id', 'openid_phone', 'openid_public'], function(err, data) {
                    if (err) {
                        res.code = ErrorCode.errorQuery;
                        res.message = err.message;
                        process.nextTick(function() { cb(res); });
                        app.logger.error("登录 [%j] 异常,err:", param, err.stack);
                        return;
                    }
                    if (data) { // 如果当前用户 ID 存在 那么将用户 ID 返回
                        data.dataValues.uid = data.dataValues.id;
                        existdo({
                            token: token,
                            userinfo: data.dataValues
                        });
                    }
                    notexistdo({
                        token: token,
                        userinfo: {}
                    });
                });
            });
        }

        function userExistDo(data) {
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
            return WXTypeDo[loginApp.type].userExistDo(data).then(function(d) {
                return WXTypeDo[loginApp.type].storeToken(d);
            });
        }

        function userNExistDo(data) {
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
            return WXTypeDo[loginApp.type].storeUserInfo(data).then(function(d) {
                return WXTypeDo[loginApp.type].readUserInfo(d);
            }).then(function(d) {
                return WXTypeDo[loginApp.type].storeToken(d);
            });
        }

        var WXTypeDo = {
            JSAPI: {
                userExistDo: function(data) {
                    return new Promise(function(fulfill) {
                        if (data.userinfo.openid_public && data.userinfo.openid_public.length !== 0) {
                            fulfill(data);
                            return;
                        }
                        // 如果为空那么进行更新
                        app.dbhelper.update("user", { openid_public: data.token.openid }, { id: data.userinfo.id }, function(err) {
                            if (err) {
                                res.code = ErrorCode.errorStore;
                                res.message = err.message;
                                process.nextTick(function() { cb(res); });
                                app.logger.error("登录 [%j] 异常,err:", param, err.stack);
                                return;
                            }
                            fulfill(data);
                        });
                    });
                },
                storeUserInfo: function(data) {
                    return new Promise(function(fulfill) {
                        app.dbhelper.storeUserInfo({
                            openid_public: data.token.openid,
                            unionid: data.token.unionid,
                            type: "JSAPI",
                            loginAppId: loginAppId
                        }, function(err) {
                            if (err) {
                                res.code = ErrorCode.errorStore;
                                res.message = err.message;
                                process.nextTick(function() { cb(res); });
                                app.logger.error("登录 [%j] 异常,err:", param, err.stack);
                                return;
                            }
                            fulfill(data);
                        });
                    });
                },
                readUserInfo: function(data) {
                    return new Promise(function(fulfill) {
                        app.dbhelper.getUserInfoByUnionid(data.token.unionid, ['id'], function(err, d) {
                            if (err) {
                                res.code = ErrorCode.errorQuery;
                                res.message = err.message;
                                process.nextTick(function() { cb(res); });
                                app.logger.error("登录 [%j] 异常,err:", param, err.stack);
                                return;
                            }
                            if (!d) { // 如果存储后却没有查询到数据 那么相当于异常情况
                                res.code = ErrorCode.errorQuery;
                                res.message = "系统异常";
                                process.nextTick(function() { cb(res); });
                                app.logger.error("登录 [%j] 异常,数据存储后没有查询到记录", param);
                                return;
                            }
                            data.userinfo.uid = d.dataValues.id;
                            fulfill(data);
                        });
                    });
                },
                storeToken: function(data) {
                    return new Promise(function(fulfill) {
                        fulfill(data);
                    });
                }
            },
            APP: {
                userExistDo: function(data) {
                    return new Promise(function(fulfill) {
                        if (data.userinfo.openid_phone && data.userinfo.openid_phone.length !== 0) {
                            fulfill(data);
                            return;
                        }
                        // 如果为空那么进行更新
                        app.dbhelper.update("user", {
                            openid_phone: data.token.openid,
                            deviceId: deviceId,
                            system: system
                        }, { id: data.userinfo.id }, function(err) {
                            if (err) {
                                res.code = ErrorCode.errorStore;
                                res.message = err.message;
                                process.nextTick(function() { cb(res); });
                                app.logger.error("登录 [%j] 异常,err:", param, err.stack);
                                return;
                            }
                            fulfill(data);
                        });
                    });
                },
                storeUserInfo: function(data) {
                    return new Promise(function(fulfill) {
                        app.dbhelper.storeUserInfo({
                            openid_phone: data.token.openid,
                            unionid: data.token.unionid,
                            deviceId: deviceId,
                            system: system,
                            type: "APP",
                            loginAppId: loginAppId
                        }, function(err) {
                            if (err) {
                                res.code = ErrorCode.errorStore;
                                res.message = err.message;
                                process.nextTick(function() { cb(res); });
                                app.logger.error("登录 [%j] 异常,err:", param, err.stack);
                                return;
                            }
                            data.userinfo = {};
                            fulfill(data);
                        });
                    });
                },
                readUserInfo: function(data) {
                    return new Promise(function(fulfill) {
                        app.dbhelper.getUserInfoByUnionid(data.token.unionid, ['id'], function(err, d) {
                            if (err) {
                                res.code = ErrorCode.errorQuery;
                                res.message = err.message;
                                process.nextTick(function() { cb(res); });
                                app.logger.error("登录 [%j] 异常,err:", param, err.stack);
                                return;
                            }
                            if (!d) { // 如果存储后却没有查询到数据 那么相当于异常情况
                                res.code = ErrorCode.errorQuery;
                                res.message = "系统异常";
                                process.nextTick(function() { cb(res); });
                                app.logger.error("登录 [%j] 异常,数据存储后没有查询到记录", param);
                                return;
                            }
                            data.userinfo.uid = d.dataValues.id;
                            fulfill(data);
                        });
                    });
                },
                storeToken: function(data) {
                    return new Promise(function(fulfill) {
                        tokenStore(data.userinfo.uid, {
                            now: Math.floor(new Date().getTime() / 1000),
                            access_token: data.token.access_token,
                            refresh_token: data.token.refresh_token,
                            expires_in: data.token.expires_in
                        }, function(err) {
                            if (err) {
                                res.code = ErrorCode.errorStore;
                                res.message = "系统异常";
                                process.nextTick(function() { cb(res); });
                                app.logger.error("登录 [%j] 异常,err:", param, err.stack);
                                return;
                            }
                            fulfill(data);
                        });
                    });
                }
            }
        };
    }

    function tokenStore(uid, value, cb) {
        app.redis.set(app.token_prefix + uid, JSON.stringify(value), app.token_expire, cb);
    }
};