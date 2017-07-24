/**
 * Created by rootistrator on 2015/11/2.
 * 后续所有的配置文件都使用该配置文件
 */
module.exports = {
    // 开发环境配置
    development: {
        TestPlat: true,
        db: {
            fcpay: {
                "host": "127.0.0.1",
                "port": 3306,
                "user": "root",
                "password": "123456",
                "database": "fcpay",
                "charset": "UTF8_GENERAL_CI",
                "connectNum": 3,
                "idleTimeoutMillis": 30000
            },
            common: {
                "host": "127.0.0.1",
                "port": 3306,
                "user": "root",
                "password": "123456",
                "database": "common",
                "charset": "UTF8_GENERAL_CI",
                "connectNum": 3,
                "idleTimeoutMillis": 30000
            }
        },
        RedisConfig: {
            "host": "127.0.0.1",
            "port": 6379,
            "connectNum": 5,
            "idleTimeoutMillis": 30000,
            "debug": false,
            "log": false,
            "password": "test"
        },
        nonceExpireTime: 3 * 60, // nonce 有效时间,在有效时间内 nonce 不能重复
        lockExpireTime: 30 * 1000
    }
};