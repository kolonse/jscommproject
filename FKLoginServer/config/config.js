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
            "host": "127.0.0.1",
            "port": 3306,
            "user": "root",
            "password": "123456",
            "database": "fclogin",
            "charset": "UTF8_GENERAL_CI",
            "connectNum": 5,
            "idleTimeoutMillis": 30000
        },
        RedisConfig: {
            "host": "127.0.0.1",
            "port": 6379,
            "connectNum": 5,
            "idleTimeoutMillis": 30000,
            "debug": false,
            "log": false,
            "password": "test"
        }
    }
};