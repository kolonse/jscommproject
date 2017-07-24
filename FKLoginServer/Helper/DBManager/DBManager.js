/**
 * Created by Administrator on 2015/9/30.
 */
var Sequelize = require("sequelize");
module.exports = function(config) {
    var db = new Sequelize(config.database, config.user, config.password, {
        host: config.host,
        port: config.port,
        dialect: 'mysql',
        pool: {
            max: config.connectNum,
            min: 0,
            idle: config.idleTimeoutMillis
        }
    });
    return {
        user: db.define('user', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            type: {
                type: Sequelize.STRING
            },
            openid_phone: {
                type: Sequelize.STRING,
            },
            openid_public: {
                type: Sequelize.STRING,
            },
            unionid: {
                type: Sequelize.STRING
            },
            deviceId: {
                type: Sequelize.STRING
            },
            system: {
                type: Sequelize.STRING
            },
            // 推广员 ID
            promoter: {
                type: Sequelize.STRING
            },
            extra: {
                type: Sequelize.TEXT
            },
            // 推广员 ID
            leader: {
                type: Sequelize.INTEGER
            },
            // 工会ID
            labourunionId: {
                type: Sequelize.INTEGER
            },
            loginAppId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: -1
            }
        }, {
            freezeTableName: true
        }),
        app: db.define('app', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            uniqueStr: {
                type: Sequelize.STRING,
                unique: true
            },
            appName: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false
            },
            appid: { // 应用 appid
                type: Sequelize.STRING,
                allowNull: false
            },
            secret: { // 应用 私钥
                type: Sequelize.STRING,
                allowNull: false
            },
            type: {
                type: Sequelize.ENUM,
                values: ['JSAPI', 'APP'],
                allowNull: false,
                defaultValue: "APP"
            },
            url: { // 微信服务 url
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "https://api.weixin.qq.com/"
            }
        }, {
            freezeTableName: true,
            // timestamps: false
        }),
    };
};