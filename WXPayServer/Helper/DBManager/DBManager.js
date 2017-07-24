/**
 * Created by Administrator on 2015/9/30.
 */
var Sequelize = require("sequelize");
module.exports = function(config) {
    var db = new Sequelize(config.fcpay.database, config.fcpay.user, config.fcpay.password, {
        host: config.fcpay.host,
        port: config.fcpay.port,
        dialect: 'mysql',
        pool: {
            max: config.fcpay.connectNum,
            min: 0,
            idle: config.fcpay.idleTimeoutMillis
        }
    });
    var dbcommon = new Sequelize(config.common.database, config.common.user, config.common.password, {
        host: config.common.host,
        port: config.common.port,
        dialect: 'mysql',
        pool: {
            max: config.common.connectNum,
            min: 0,
            idle: config.common.idleTimeoutMillis
        }
    });
    return {
        pay: db.define('pay', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                unique: true,
                autoIncrement: true
            },
            orderId: {
                type: Sequelize.STRING,
                unique: true
            },
            status: {
                type: Sequelize.INTEGER
            },
            shopid: {
                type: Sequelize.INTEGER
            },
            price: {
                type: Sequelize.INTEGER
            },
            uid: {
                type: Sequelize.INTEGER
            },
            time_start: {
                type: Sequelize.STRING
            },
            time_expire: {
                type: Sequelize.STRING
            },
            time_end: {
                type: Sequelize.STRING
            },
            openid: {
                type: Sequelize.STRING
            },
            trade_type: { //交易类型
                type: Sequelize.STRING
            },
            ip: {
                type: Sequelize.STRING
            },
            device_info: { //设备信息
                type: Sequelize.STRING
            },
            mch_id: { // 商家号
                type: Sequelize.STRING
            },
            prepay_id: { // 订单预付 id
                type: Sequelize.STRING
            },
            transaction_id: { // 微信订单号
                type: Sequelize.STRING
            },
            err_code: { // 订单支付失败的错误码
                type: Sequelize.STRING
            },
            err_code_des: { // 订单支付失败描述
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
            payAppId: {
                type: Sequelize.INTEGER
            }
        }, {
            freezeTableName: true,
            timestamps: false
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
            trade_type: {
                type: Sequelize.ENUM,
                values: ['JSAPI', 'APP'],
                allowNull: false
            },
            loginserverUrl: {
                type: Sequelize.STRING,
                allowNull: false
            },
            orderquery: {
                type: Sequelize.STRING,
                allowNull: false
            },
            unfiedorder: {
                type: Sequelize.STRING,
                allowNull: false
            },
            mch_id: {
                type: Sequelize.STRING,
                allowNull: false
            },
            mch_body: {
                type: Sequelize.STRING,
                allowNull: false
            },
            mch_key: {
                type: Sequelize.STRING,
                allowNull: false
            },
            appid: {
                type: Sequelize.STRING,
                allowNull: false
            },
            expire: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            notify_url: {
                type: Sequelize.STRING,
                defaultValue: "https://wxpublic.youdianle.com.cn/pay/api/notify",
                allowNull: false
            },
            // 如果 trade_type 为 JSAPI 时,该字段必须填写
            jsapi: {
                type: Sequelize.STRING,
                // defaultValue: "pay.html"
            },
            // 游戏服务器发货通知接口
            game_notify_url: {
                type: Sequelize.STRING,
                allowNull: false
            }
        }, {
            freezeTableName: true,
            // timestamps: false
        }),
        shopinfo: dbcommon.define('shopinfo', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                unique: true
            },
            name: {
                type: Sequelize.STRING
            },
            price: {
                type: Sequelize.DOUBLE
            },
            status: {
                type: Sequelize.INTEGER
            },
            count: {
                type: Sequelize.INTEGER
            }
        }, {
            freezeTableName: true
        }),
        shopinfo_sandbox: dbcommon.define('shopinfo_sandbox', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                unique: true
            },
            name: {
                type: Sequelize.STRING
            },
            price: {
                type: Sequelize.DOUBLE
            },
            status: {
                type: Sequelize.INTEGER
            },
            count: {
                type: Sequelize.INTEGER
            }
        }, {
            freezeTableName: true
        })
    };
};