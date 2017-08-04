/**
 * Created by rootistrator on 2015/11/2.
 * 后续所有的配置文件都使用该配置文件
 */
module.exports = {
    // 开发环境配置
    development: {
        // 是否开启测试平台 默认false,如果是线上环境 必须注意该配置项为false
        TestPlat: true,
        db: {
            fcadmin: {
                "host": "127.0.0.1",
                "port": 3306,
                "user": "admin",
                "password": "trW0a8GS*POnur*e",
                "database": "fcadmin",
                "charset": "UTF8_GENERAL_CI",
                "connectNum": 3,
                "idleTimeoutMillis": 30000
            },
            fkfish: {
                "host": "127.0.0.1",
                "port": 3306,
                "user": "admin",
                "password": "trW0a8GS*POnur*e",
                "database": "fkfish",
                "charset": "UTF8_GENERAL_CI",
                "connectNum": 3,
                "idleTimeoutMillis": 30000
            },
            fklogin: {
                "host": "127.0.0.1",
                "port": 3306,
                "user": "admin",
                "password": "trW0a8GS*POnur*e",
                "database": "fclogin",
                "charset": "UTF8_GENERAL_CI",
                "connectNum": 2,
                "idleTimeoutMillis": 30000
            },
            common: {
                "host": "127.0.0.1",
                "port": 3306,
                "user": "admin",
                "password": "trW0a8GS*POnur*e",
                "database": "common",
                "charset": "UTF8_GENERAL_CI",
                "connectNum": 3,
                "idleTimeoutMillis": 30000
            },
            fcpay: {
                "host": "127.0.0.1",
                "port": 3306,
                "user": "admin",
                "password": "trW0a8GS*POnur*e",
                "database": "fcpay",
                "charset": "UTF8_GENERAL_CI",
                "connectNum": 3,
                "idleTimeoutMillis": 30000
            }
        },
        ghlogserver: "http://127.0.0.1:11110/exec",
        amq: "amqp://127.0.0.1",
        noticeServerUrl: "http://120.27.209.110:7100/updateNotice/development",
        sycmessageServerUrl: "http://120.27.209.110:7100/updateUnTimeCycMsg/development"
    }
};