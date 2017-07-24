var path = require("path")
Object.defineProperty(global, '__stack', {
    get: function(){
        var orig = Error.prepareStackTrace;
        Error.prepareStackTrace = function(_, stack){ return stack; };
        var err = new Error;
        Error.captureStackTrace(err, arguments.callee);
        var stack = err.stack;
        Error.prepareStackTrace = orig;
        return stack;
    }
});
Object.defineProperty(global, '__file', {
    get: function(){
        return path.basename(__stack[1].getFileName()) + ":" + __stack[1].getLineNumber()
    }
});

process.chdir(__dirname); // 将工作路径切换到 app.js 的路径上
var ConfigLoader = require("./module/ConfigLoader/ConfigLoader.js");
var logger = require('./logger.js');
global.logger = logger;
var Server = require("./module/MsgReceiveServer/MsgReceiveServer.js");
var config = ConfigLoader(require("./Config/Config.js"));
var DataStoreServer = require("./module/DataStoreServer/DataStoreServer.js");
var DataQueryServer = require("./module/DataQueryServer/DataQueryServer.js");
// 启动消息接收器
var msgReceiverCfg = config.get("msgReceiver");
msgReceiverCfg.logger = logger ;
var server = Server(msgReceiverCfg);
// 启动数据查询服务
var dataQueryCfg = config.get("queryServer");
dataQueryCfg.logger = logger ;
var dataQueryServer = DataQueryServer(dataQueryCfg);
// 启动数据存储服务
var dataStoreCfg = config.get("storeServer");
dataStoreCfg.logger = logger ;
var dataStoreServer = DataStoreServer(dataStoreCfg);

// 启动数据库服务
var Code = require("./ErrorCode.js");
// 日志服务配置 ip地址配置为 ActiveMq 部署的服务器
//LogClient:{
//    uri:"amqp://121.196.226.18"
//},
// 如果子进程的配置数目为 1 那么不再启动子进程 否则开始启动 countOfChildProcess - 1 的子进程数量
var countOfChildProcess = config.countOfChildProcess ;
if(!countOfChildProcess){ //如果没有配置那么默认使用CPU个数目
    countOfChildProcess = require("os").cpus().length;
}

// 如果从命令行指定了 子进程数量 那么就无视配置文件配置
var logrun = false ;
for( var i = 2; i < process.argv.length; i ++ ){
    if(  /--cocp=/.test(process.argv[i])){
        countOfChildProcess = parseInt(process.argv[i].substr("--cocp=".length));
    }
    if(  /--logrun=/.test(process.argv[i])){
        logrun = process.argv[i].substr("--logrun=".length) === "true"?true:false;
    }
}

var logClient = require("./module/MsgSenderClient/MsgSenderClient.js")(config.get("LogClient") || {name:"amq.msg.warning"});

var FilterManager = require("./module/FilterManager/FilterManager.js");
var filterManager = new FilterManager ;

server.on("data",function(message){
    /**
     * 1.对消息格式先进行校验 不是标准格式的消息那么就直接过滤
     * 消息格式 :
     * {
     *  event:xxxx,
     *  data:{}
     * }
     * event:表示事件
     * data:事件  内容
     *
     * 2.将消息抛送到消息存储器中
     */
    if(filterManager.Pass(message)){
        dataStoreServer.Add(message)
            .then(function(){
                logger.info( "消息 [%j] 存储成功", message);
            })
            .catch(function(err){
                logger.error( "消息 [%j] 存储失败,err:", message,err);
            });

        if(message.event === "userRecord"){
            logClient.send(message,function(err){
                if(err){
                    logger.error( "消息 [%j] 发送失败,err:", message,err);
                }
            })
        }
    }else{
        logger.debug("%s | 消息被过滤 message:%j",__file,message)
    }
})
server.on("error",function(err){
    logger.error("数据接收服务出错,err:",err);
});

dataQueryServer.on("exec",function(data,cb){
    logger.info( "执行 [%j] 请求开始", data);
    dataStoreServer.exec(data)
        .then(function(result){
            logger.info( "执行 [%j] 完成 执行结果码:%d", data,result.code);
            cb(result);
        })
        .catch(function(err){
            logger.error( "执行 [%j] 完成 执行异常,err:", data,err);
            cb({
                code:Code.ErrorSystemExcept,
                message:err.message
            });
        })
});

dataQueryServer.on("execPipe",function(data,stream,cb){
    logger.info( "执行 [%j] 请求开始", data);
    dataStoreServer.execPipe(data,stream)
        .then(function(result){
            logger.info( "执行 [%j] 完成 执行结果码:%d", data,result.code);
            cb(result);
        })
        .catch(function(err){
            logger.error( "执行 [%j] 完成 执行异常,err:", data,err);
            cb({
                code:Code.ErrorSystemExcept,
                message:err.message
            });
        })
});

if(logrun === true){
    server.run();
    logClient.run(function(err){
        if( err ){
            logger.error("日志服务客户端启动异常,err:", err);
        }else{
            logger.info("日志服务客户端启动完成");
        }
    });
}

dataQueryServer.run();

//var workers = {};
//var cluster = require("cluster");
//if( cluster.isMaster ){
//    cluster.on("death",function(worker){
//        delete workers[worker.pid];
//        worker = cluster.fork();
//        workers[worker.pid] = worker;
//    });
//    for(var i = 0; i < countOfChildProcess; i ++){
//        var worker = cluster.fork();
//        workers[worker.pid] = worker;
//    }
//}else{
//    var app = require("./app");
//}
var fs = require("fs");
var os = require("os");
var child_process = cp = require("child_process");
function PIDHelper(){
    this.file = path.join(__dirname,"child_process.pid");
    this.pids = {} ;

}
PIDHelper.prototype.kill = function(){
    if(!fs.existsSync(this.file)){
        return ;
    }
    var pidStr = fs.readFileSync(this.file);
    var pids = null ;
    try{
        pids = JSON.parse(pidStr);
    }catch(e){
        return ;
    }
    for(var id in pids){
        var pid = pids[id];
        if( /win32/.test(os.platform()) ){
            child_process.spawn("taskkill",["/F","/PID",pid,"/T"]);
        }else{
            child_process.spawn("kill",["-9",pid]);
        }
    }
}

PIDHelper.prototype.update = function(id,pid){
    this.pids[id] = pid ;
    return this ;
}

PIDHelper.prototype.save = function(){
    fs.writeFileSync(this.file,JSON.stringify(this.pids));
    return this ;
}

if( countOfChildProcess > 1 ){
	var childList = [];
	function regist(child){
		child.stdout.on('data', function (data) {
			console.log(data.toString());
		});
		child.stderr.on('data', function (data) {
			console.log(data.toString());
		});
		child.on("exit",function(code){
			logger.error( "子进程 [pid:%s] 退出,code:%s", child.pid,code);
		});	
	}
	var pidHelper = new PIDHelper;
	pidHelper.kill();	
    for( var i = 0; i < countOfChildProcess - 1; i ++ ){
        var child = cp.spawn("node",["app.js","--dqs=false","--cocp=1","--logrun=true"]);
        childList.push(child);
        logger.info( "启动子进程 [pid:%s]", child.pid);
		regist(child);
		pidHelper.update(i,child.pid);
    }
	pidHelper.save();
	process.on('exit', function () {
		for(var i = 0;i < childList.length;i ++){
			//cp.spawn("kill",["-9",childList[i].pid])
			childList[i].kill();
		}
	});
}
