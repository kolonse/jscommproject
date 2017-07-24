var logger = require('./logger.js');
var DB = require("./Helper/DBHelper");
var DBManger = require("./Helper/DBManager/DBManager");
var Config = require("./config/config.js");
var config = require("./Helper/ConfigLoader/ConfigLoader.js")(Config);
var dbinst = DBManger(config.get("db"));
var redis = require("./Helper/Redis/Redis.js")(config.get("RedisConfig"));
var Promise = require("promise");
var apps = {};
dbinst.user.sync()
    .then(function() {
        return dbinst.app.sync();
    })
    .then(function() {
        return dbinst.app.findAll()
            .then(function(datas) {
                for (var i = 0; i < datas.length; i++) {
                    var v = datas[i].dataValues;
                    apps[v.id] = v;
                }

                return new Promise(function(fulfill) { fulfill(); });
            });
    })
    .then(function() {
        var db = new DB({
            db: dbinst
        });
        var wxServer = new(require("./Helper/WXServer"))({
            dbhelper: db,
            port: 14004,
            logger: logger,
            name: "微信登录通用平台",
            redis: redis,
            apps: apps
        });
    });

var testPlat = config.get("TestPlat");
if (testPlat) {
    var WXTestPlat = require("./Helper/WXTestPlat");
    var wxTestPlat = new WXTestPlat({
        logger: logger
    });
}