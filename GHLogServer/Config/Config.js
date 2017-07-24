/**
 * Created by Administrator on 2015/10/27.
 * 配置文件
 */

module.exports = {
    development:{ //开发环境配置
        // 启动的子进程数量 用来提高消息处理速度 建议此值比CPU数目少1,
        // 原因是因为要留下一个CPU给activemq使用,
        // 如果activemq和此服务不再一台机器上那么可以配置为CPU数目
//        countOfChildProcess:4,
        // 消息接收器配置
        LogClient:{
            name:"amq.msg.warning",
            uri:"amqp://localhost"
        },
        msgReceiver:{
            uri:"amqp://localhost",
            name:"amq.msg.queue"
        },
        storeServer:{
            uri:"mongodb://127.0.0.1:27017/storeServer",
            schema:{
                event:String,
                data:Object
            }
        },
        queryServer:{
            listenPort:11110,
            bRun:true //配置查询服务是否运行
        }
    }
}
