/**
 * Created by Administrator on 2015/9/30.
 */
var Sequelize = require("sequelize");
module.exports = function(config) {
    var db = new Sequelize(config.fcadmin.database, config.fcadmin.user, config.fcadmin.password, {
        host: config.fcadmin.host,
        port: config.fcadmin.port,
        dialect: 'mysql',
        pool: {
            max: config.fcadmin.connectNum,
            min: 0,
            idle: config.fcadmin.idleTimeoutMillis
        },
        timezone: '+08:00'
    });
    var dbfkfish = new Sequelize(config.fkfish.database, config.fkfish.user, config.fkfish.password, {
        host: config.fkfish.host,
        port: config.fkfish.port,
        dialect: 'mysql',
        pool: {
            max: config.fkfish.connectNum,
            min: 0,
            idle: config.fkfish.idleTimeoutMillis
        },
        timezone: '+08:00'
    });
    var dbfklogin = new Sequelize(config.fklogin.database, config.fklogin.user, config.fklogin.password, {
        host: config.fklogin.host,
        port: config.fklogin.port,
        dialect: 'mysql',
        pool: {
            max: config.fklogin.connectNum,
            min: 0,
            idle: config.fklogin.idleTimeoutMillis
        },
        timezone: '+08:00'
    });
    var fcpay = new Sequelize(config.fcpay.database, config.fcpay.user, config.fcpay.password, {
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
        user: db.define('user', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            username: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false
            },
            phone: {
                type: Sequelize.STRING
            },
            ip: {
                type: Sequelize.STRING
            },
            loginTime: {
                type: Sequelize.STRING
            },
            wxaccount: {
                type: Sequelize.STRING
            },
            remark: {
                type: Sequelize.TEXT
            },
            extra: {
                type: Sequelize.TEXT
            },
            status: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            power: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            powerdiy: {
                type: Sequelize.TEXT
            },
            boss: { // 创建者
                type: Sequelize.INTEGER,
                defaultValue: 0
            }
        }, {
            freezeTableName: true
        }),
        proxy: db.define('proxy', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            username: {
                type: Sequelize.STRING
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false
            },
            phone: {
                type: Sequelize.STRING
            },
            ip: {
                type: Sequelize.STRING
            },
            loginTime: {
                type: Sequelize.STRING
            },
            wxaccount: {
                type: Sequelize.STRING
            },
            unionmaxcount: { // 工会最大上限
                type: Sequelize.INTEGER
            },
            sharingrate: { // 分成比例
                type: Sequelize.INTEGER
            },
            gameList: { // 游戏列表
                type: Sequelize.STRING
            },
            remark: {
                type: Sequelize.TEXT
            },
            status: {
                type: Sequelize.INTEGER
            },
            extra: {
                type: Sequelize.TEXT
            },
            openid: { // 代理用户另一个唯一性属性
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            indexes: [{ unique: true, fields: ['openid', 'username'] }]
        }),
        union: db.define('union', { // 工会数据表
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: { // 工会名称
                type: Sequelize.STRING
            },
            gameId: {
                type: Sequelize.INTEGER
            },
            proxyId: {
                type: Sequelize.INTEGER
            },
            extra: {
                type: Sequelize.TEXT
            }
        }, {
            freezeTableName: true
        }),
        unioner: db.define('unioner', { // 工会成员数据表
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            username: { // 用户名
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            playerGameId: {
                type: Sequelize.INTEGER
            },
            type: { // 身份类型
                type: Sequelize.INTEGER
            },
            proxyId: { //
                type: Sequelize.INTEGER,
            },
            unionId: {
                type: Sequelize.INTEGER
            },
            sharingrate: {
                type: Sequelize.INTEGER
            },
            status: {
                type: Sequelize.INTEGER
            },
            remark: {
                type: Sequelize.TEXT
            },
            extra: {
                type: Sequelize.TEXT
            }
        }, {
            freezeTableName: true
        }),
        game: db.define('game', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            gameName: {
                type: Sequelize.STRING,
                primaryKey: true
            }
        }, {
            freezeTableName: true
        }),
        gameapp: db.define('gameapp', {
            id: {
                type: Sequelize.STRING,
                primaryKey: true
            },
            appName: {
                type: Sequelize.STRING,
                primaryKey: true
            },
            gameId: {
                type: Sequelize.INTEGER,
            },
            callbackUrl: { // 服务器回调 URL
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true
        }),
        data: db.define('data', {
            id: {
                type: Sequelize.STRING,
                primaryKey: true
            },
            data: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true
        }),
        notice: db.define("notice", {
            beginDate: {
                type: Sequelize.STRING
            },
            endDate: {
                type: Sequelize.STRING
            },
            noticeType: {
                type: Sequelize.STRING
            },
            noticeTitle: {
                type: Sequelize.STRING
            },
            noticeContent: {
                type: Sequelize.TEXT
            },
            who: {
                type: Sequelize.STRING
            },
            status: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true
        }),
        unTimeCycleMessage: db.define("unTimeCycleMessage", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            broadcastContent: {
                type: Sequelize.STRING
            },
            status: {
                type: Sequelize.STRING
            },
            who: {
                type: Sequelize.STRING
            },
            startTime: {
                type: Sequelize.STRING
            },
            endTime: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true
        }),
        issueorder: db.define("issueorder", {
            id: {
                type: Sequelize.STRING,
                primaryKey: true
            },
            uid: {
                type: Sequelize.INTEGER
            },
            reason: {
                type: Sequelize.TEXT
            },
            shop: {
                type: Sequelize.STRING
            },
            status: {
                type: Sequelize.INTEGER
            },
            extra: {
                type: Sequelize.TEXT
            },
            admin: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true
        }),
        roles: dbfkfish.define("roles", {
            uid: {
                type: Sequelize.INTEGER,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING
            },
            room_card: {
                type: Sequelize.INTEGER
            },
            total_charge: {
                type: Sequelize.INTEGER
            },
            vip_level: {
                type: Sequelize.INTEGER
            },
            leader: {
                type: Sequelize.INTEGER
            },
            sys_flags: {
                type: Sequelize.INTEGER
            },
            last_login: {
                type: Sequelize.STRING
            },
            create_time: {
                type: Sequelize.STRING
            },
            unionId: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            timestamps: false
        }),
        data_record: dbfkfish.define("data_record", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            uid: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            type: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            unionId: {
                type: Sequelize.INTEGER
            },
            leader: {
                type: Sequelize.INTEGER
            },
            count: {
                type: Sequelize.INTEGER
            },
            time: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            timestamps: false
        }),
        fkloginuser: dbfklogin.define('user', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true
            },
            // 推广员 ID
            leader: {
                type: Sequelize.INTEGER
            },
            // 工会ID
            labourunionId: {
                type: Sequelize.INTEGER
            }
        }, {
            freezeTableName: true
        }),
        shopinfo: dbcommon.define('shopinfo', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                unique: true
            },
            name: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true
        }),
        pay: fcpay.define('pay', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true
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
            }
        }, {
            freezeTableName: true,
            timestamps: false
        }),
        leadercarduse: db.define("leadercarduse", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            leader: {
                type: Sequelize.INTEGER
            },
            count: {
                type: Sequelize.DECIMAL(18, 2)
            },
            date: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            timestamps: false
        }),
        leadernewuser: db.define("leadernewuser", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            leader: {
                type: Sequelize.INTEGER
            },
            count: {
                type: Sequelize.DECIMAL(18, 2)
            },
            date: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            timestamps: false
        }),
        leaderonlineuser: db.define("leaderonlineuser", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            leader: {
                type: Sequelize.INTEGER
            },
            count: {
                type: Sequelize.DECIMAL(18, 2)
            },
            date: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            timestamps: false
        }),
        leadercharge: db.define("leadercharge", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            leader: {
                type: Sequelize.INTEGER
            },
            money: {
                type: Sequelize.DECIMAL(18, 2)
            },
            date: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            timestamps: false
        }),
        leaderincome: db.define("leaderincome", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            leader: {
                type: Sequelize.INTEGER
            },
            selfmoney: { // 自己推广收益的钱
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            unionermoney: { // 副会长分成给会长的收益部分
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            total: { // 会长最终得到的收益, 是自己推广收益+所有副会长分给会长的收益
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            date: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            timestamps: false
        }),
        proxycarduse: db.define("proxycarduse", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            proxyId: {
                type: Sequelize.INTEGER
            },
            count: {
                type: Sequelize.DECIMAL(18, 2)
            },
            date: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            timestamps: false
        }),
        proxynewuser: db.define("proxynewuser", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            proxyId: {
                type: Sequelize.INTEGER
            },
            count: {
                type: Sequelize.DECIMAL(18, 2)
            },
            date: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            timestamps: false
        }),
        proxyonlineuser: db.define("proxyonlineuser", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            proxyId: {
                type: Sequelize.INTEGER
            },
            count: {
                type: Sequelize.DECIMAL(18, 2)
            },
            date: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            timestamps: false
        }),
        proxycharge: db.define("proxycharge", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            proxyId: {
                type: Sequelize.INTEGER
            },
            money: {
                type: Sequelize.DECIMAL(18, 2)
            },
            date: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            timestamps: false
        }),
        proxyincome: db.define("proxyincome", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            proxyId: {
                type: Sequelize.INTEGER
            },
            money: {
                type: Sequelize.DECIMAL(18, 2)
            },
            date: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            timestamps: false
        }),
        unioncarduse: db.define("unioncarduse", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            unionId: {
                type: Sequelize.INTEGER
            },
            count: {
                type: Sequelize.DECIMAL(18, 2)
            },
            date: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            timestamps: false
        }),
        unionnewuser: db.define("unionnewuser", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            unionId: {
                type: Sequelize.INTEGER
            },
            count: {
                type: Sequelize.DECIMAL(18, 2)
            },
            date: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            timestamps: false
        }),
        uniononlineuser: db.define("uniononlineuser", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            unionId: {
                type: Sequelize.INTEGER
            },
            count: {
                type: Sequelize.DECIMAL(18, 2)
            },
            date: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            timestamps: false
        }),
        unioncharge: db.define("unioncharge", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            unionId: {
                type: Sequelize.INTEGER
            },
            money: {
                type: Sequelize.DECIMAL(18, 2)
            },
            date: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            timestamps: false
        }),
        unionincome: db.define("unionincome", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            unionId: {
                type: Sequelize.INTEGER
            },
            money: {
                type: Sequelize.DECIMAL(18, 2)
            },
            proxymoney: {
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            date: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            timestamps: false
        }),
        admincarduse: db.define("admincarduse", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            count: {
                type: Sequelize.DECIMAL(18, 2)
            },
            date: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            timestamps: false
        }),
        adminnewuser: db.define("adminnewuser", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            count: {
                type: Sequelize.DECIMAL(18, 2)
            },
            date: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            timestamps: false
        }),
        adminonlineuser: db.define("adminonlineuser", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            count: {
                type: Sequelize.DECIMAL(18, 2)
            },
            date: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            timestamps: false
        }),
        admincharge: db.define("admincharge", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            money: {
                type: Sequelize.DECIMAL(18, 2)
            },
            date: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            timestamps: false
        }),
        adminincome: db.define("adminincome", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            money: {
                type: Sequelize.DECIMAL(18, 2)
            },
            date: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            timestamps: false
        }),
        warnlog: db.define("warnlog", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            uid: {
                type: Sequelize.INTEGER
            },
            time: {
                type: Sequelize.STRING
            },
            type: {
                type: Sequelize.INTEGER
            },
            level: {
                type: Sequelize.INTEGER
            },
            value: {
                type: Sequelize.INTEGER
            },
            status: { // 处理状态 0表示未处理 1表示已处理
                type: Sequelize.INTEGER,
                defaultValue: 0
            }
        }, {
            freezeTableName: true
        }),
        feedback: dbfkfish.define("feedback", {
            id: {
                type: Sequelize.STRING,
                primaryKey: true
            },
            uid: {
                type: Sequelize.INTEGER
            },
            time: {
                type: Sequelize.STRING
            },
            content: {
                type: Sequelize.TEXT
            },
            feedback: {
                type: Sequelize.TEXT
            },
            flag: {
                type: Sequelize.INTEGER
            },
            version: {
                type: Sequelize.STRING
            },
            device: {
                type: Sequelize.STRING
            },
        }, {
            freezeTableName: true,
            timestamps: false
        }),
        gamewinstatic: db.define("gamewinstatic", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            pp: { // public play   公众场总玩
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            pg: { // public get 公众场总得
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            pw: { // public win 公众场盈利
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            cp: { // classical play   经典房总玩
                type: Sequelize.DECIMAL(18, 2)
            },
            cg: { // classical get 经典房总得
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            cw: { // classical win 经典房盈利
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            tw: { // total win 总盈利
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            date: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            timestamps: false
        }),
        gamegolditem: db.define("gamegolditem", { // 每日金币账单（金币）
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            cv: { // 房卡兑换 card vary  
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            tw: { // 游戏总赢 game win
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            og: { //携带总量 own gold 
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            ogv: { //携带总量变化量 own gold vary
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            ev: { //经典房创建(+续费) classical create count
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            date: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            timestamps: false
        }),
        gamecarditem: db.define("gamecarditem", { // 房卡账单
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            tc: { //总充值 total count
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            gc: { //赠送总额 give count
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            cu: { //房卡消耗 card use
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            oc: { //携带总量 own count
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            ocv: { //携带变化量 own count vary
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            ev: { //异常值 except value
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            date: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            timestamps: false
        }),
        gamecardgive: db.define("gamecardgive", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            acount: { //后台赠送
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            fcount: { //首次奖励 
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            rcount: { //玩家受赠
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            scount: { //玩家赠出
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            dcount: { //后台扣除
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            date: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            timestamps: false
        }),
        gamechargeitem: db.define("gamechargeitem", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            tmoney: { //充值总额 total money
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            imoney: { //补单总额 issue money 
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            aincome: { //总部营收 admin income
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            pincome: { //代理营收 proxy income
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            uincome: { //会长营收 unioner income
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            vincome: { // 副会长营收 unioner
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            date: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            timestamps: false
        }),
        gamecarduse: db.define("gamecarduse", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            fcc: { //竞技场创建 fight create count
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            fbc: { //竞技场返还 fight back count 
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            ccc: { //经典房创建(+续费) classical create count
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            cbc: { //经典房返还 classical back count
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            scc: { //夺宝房创建 seize create count
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            sbc: { //夺宝房返还 seize back count
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            tg: { //兑换金币 token gold
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            date: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            timestamps: false
        }),
        proxydatestatic: db.define("proxydatestatic", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            newuser: { //竞技场创建 fight create count
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            onlineuser: { //竞技场返还 fight back count 
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            charge: { //经典房创建(+续费) classical create count
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            carduse: { //经典房返还 classical back count
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            date: {
                type: Sequelize.STRING
            },
            proxyId: {
                type: Sequelize.INTEGER
            }
        }, {
            freezeTableName: true,
            timestamps: false
        }),
        uniondatestatic: db.define("uniondatestatic", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            newuser: { //竞技场创建 fight create count
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            onlineuser: { //竞技场返还 fight back count 
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            charge: { //经典房创建(+续费) classical create count
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            carduse: { //经典房返还 classical back count
                type: Sequelize.DECIMAL(18, 2),
                defaultValue: 0
            },
            date: {
                type: Sequelize.STRING
            },
            unionId: {
                type: Sequelize.INTEGER
            }
        }, {
            freezeTableName: true,
            timestamps: false
        }),
    };
};