var logger = require('./logger.js');
var DB = require("./Helper/DBHelper");
var DBManger = require("./Helper/DBManager/DBManager");
var Config = require("./config/config.js");
var config = require("./Helper/ConfigLoader/ConfigLoader.js")(Config);
var dbinst = DBManger(config.get("db"));
var redis = require("./Helper/Redis/Redis.js")(config.get("RedisConfig"));
dbinst.user.sync()
    .then(function() {
        return dbinst.app.sync();
    })
    .then(function() {
        var db = new DB({
            db: dbinst
        });
        var wxPhone = new(require("./Helper/WXServer"))({
            dbhelper: db,
            port: 30001,
            logger: logger,
            name: "微信登录",
            redis: redis
        });
    });