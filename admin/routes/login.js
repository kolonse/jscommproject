var moment = require("moment");
var ip = require("ip");
module.exports = function(app) {
    var shopinfo = app.config.get("shopinfo");
    var shops = [];
    shops.push([-1, "全部"]);
    for (var key in shopinfo) {
        shops.push([key, shopinfo[key].name]);
    }
    app.post("/login", function(req, res) {
        var param = req.body;
        param.token = req.cookies ? req.cookies.fcadmin : null;
        param.ip = req.headers['x-real-ip'] ? req.headers['x-real-ip'] : req.ip.replace(/::ffff:/, '');
        if (param.ip === "127.0.0.1") {
            param.ip = "36.7.151.35";
        }
        processReq(param, function(data) {
            res.cookie('fcadmin', data.token, {
                httpOnly: true,
                path: '/'
            });
            app.dbhelper.writeToken(data.token, param.username, function() {});
            res.json(data);
        });
    });

    function processReq(param, cb) {
        app.logger.debug("process [%j]", param);
        var res = {
            code: 0,
            message: ""
        };
        // 读取验证码
        var rand = param.rand;
        app.dbhelper.readToken(rand, function(err, v) {
            if (param.txt && param.txt.length === 0) {
                res.code = app.ErrorCode.errorCCap;
                res.message = "请输入验证码";
                process.nextTick(function() { cb(res); });
                app.logger.error("%s 登录异常,验证码错误", param.username);
                return;
            }
            if (!v) {
                res.code = app.ErrorCode.errorCCap;
                res.message = "验证码过期,重新输入";
                process.nextTick(function() { cb(res); });
                app.logger.error("%s 登录异常,验证码过期", param.username);
                return;
            }
            v = v.v;
            if (v.toLowerCase() !== param.txt.toLowerCase()) {
                res.code = app.ErrorCode.errorCCap;
                res.message = "验证码输入错误,请重试";
                process.nextTick(function() { cb(res); });
                app.logger.error("%s 登录异常,验证码输入错误,real:%s now:%s", param.username, v.toLowerCase(), param.txt.toLowerCase());
                return;
            }
            // 读取用户信息
            readInfo({
                res: res,
                param: param
            }, cb);
        });
    }

    function readInfo(arg, cb) {
        var res = arg.res;
        app.dbhelper.readUserInfo({ username: arg.param.username }, function(err, data) {
            if (err) {
                res.code = app.ErrorCode.errorRead;
                res.message = err.message;
                app.logger.error("%s 登录异常,err:", arg.param.username, err.stack);
                process.nextTick(function() { cb(res); })
                return;
            }
            if (!data) {
                res.code = app.ErrorCode.errorUsername;
                res.message = "用户不存在";
                process.nextTick(function() { cb(res); });
                app.logger.error("%s 登录异常,用户不存在", arg.param.username);
                return;
            }
            if (data.status === app.Common.PLAYER_STATUS.freeze) {
                res.code = app.ErrorCode.errorUsername;
                res.message = "用户已冻结";
                process.nextTick(function() { cb(res); });
                app.logger.error("%s 登录异常,用户已冻结", arg.param.username);
                return;
            }
            if (arg.param.password !== data.password) {
                // 需要触发密码输入错误机制
                passwordSafeCheck(arg.param.username, arg.param.password, function(err, msg) {
                    res.code = app.ErrorCode.errorPassword;
                    res.message = msg;
                    process.nextTick(function() { cb(res); });
                    app.logger.error("%s 登录异常,密码错误", arg.param.username);
                });
                return;
            }
            // 如果输入密码正确,那么需要将安全监测策略去掉
            app.dbhelper.deleteToken("safecheck_" + arg.param.username, function() {});
            arg.selfinfo = data;
            saveInfo(arg, cb);
        });
    }

    function passwordSafeCheck(user, pass, cb) {
        app.dbhelper.readToken("safecheck_" + user, function(err, data) {
            if (!data) {
                data = 0;
            } else {
                data = data.v;
            }
            if (data < app.Common.ERROR_PASS_MAX_COUNT) {
                data = data + 1;
                // 保存状态
                app.dbhelper.writeToken("safecheck_" + user, data, app.Common.ERROR_PASS_CACHE_TIME, function(err) {
                    cb(err, "密码输入错误 " + data + " 次,剩余 " + (app.Common.ERROR_PASS_MAX_COUNT - data) + " 次");
                });
            } else {
                // 冻结帐号
                app.dbhelper.update("user", { status: app.Common.PLAYER_STATUS.freeze }, { username: user }, function(err) {
                    cb(err, "密码输入错误次数上限,帐号冻结");
                });
                app.dbhelper.deleteToken("safecheck_" + user, function() {});
            }
        });
    }

    function saveInfo(arg, cb) {
        var res = arg.res;
        var param = { ip: arg.param.ip, loginTime: moment().format("YYYY-MM-DD HH:mm:ss") };
        app.dbhelper.writeUserInfo(param, { username: arg.param.username }, function(err) {
            if (err) {
                res.code = app.ErrorCode.errorWrite;
                res.message = err.message;
                process.nextTick(function() { cb(res); });
                return;
            }
            res.token = app.CommonFunction.getRandomStr();
            var config = app.config.get("gameConfig");
            if (!config) config = {};
            arg.selfinfo.ip = param.ip;
            arg.selfinfo.loginTime = param.loginTime;
            config.selfinfo = arg.selfinfo;
            delete config.selfinfo.password;
            config.dynamic = {
                shopinfo: shops
            };
            res.config = config;
            process.nextTick(function() { cb(res); });
            app.logger.info("%s 登录成功", arg.param.username);
            var log = {
                admin: arg.param.username,
                type: "admin",
                ip: arg.param.ip,
                addr: ip.findSync(arg.param.ip),
                time: moment().format("YYYY-MM-DD HH:mm:ss")
            };
            app.dblogclient.sendMsg("loginrecord", log, function(err) {
                if (err) {
                    app.logger.warn("存储日志失败 %j, err:", log, err.stack);
                }
            });
        });
    }
};