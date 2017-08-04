/**
 * Created by Administrator on 2016/6/7.
 */
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

//var memwatch = require('memwatch');
//var heapdump = require('heapdump');
//memwatch.on('leak', function(info) {
//    console.error(info);
//    var file = '/tmp/myapp-' + process.pid + '-' + Date.now() + '.heapsnapshot';
//    heapdump.writeSnapshot(file, function(err){
//        if (err) console.error(err);
//        else console.error('Wrote snapshot: ' + file);
//    });
//});

var jobs = [];

for( var i = 2; i < process.argv.length; i ++ ){
    if(  /--files=/.test(process.argv[i])){
        var arr = process.argv[i].substr("--files=".length);
        arr = arr.split(",");
        for(var j = 0;j < arr.length;j ++){
            if(arr[j].length !== 0){
                jobs.push(arr[j]);
            }
        }
    }
    if(  /--env=/.test(process.argv[i])){
        var env = process.argv[i].substr("--env=".length);
        process.env.NODE_ENV = env ;
    }
}
if(jobs.length === 0){
    process.exit(0);
}

global.logger = require(path.join(__dirname,"../../",'./logger.js'));
var merge = require('merge');
var cfg = require(path.join(__dirname,"../../","./config/config.js"));
var PublishConfig = require(path.join(__dirname,"../../","./config/PublishConfig.js"));
var publishConfig = require(path.join(__dirname,"../../","./Helper/ConfigLoader/ConfigLoader.js"))(PublishConfig);
var DBConfig = publishConfig.get("DBConfig");
var redisConfig = publishConfig.get("RedisConfig");
var httpConfig = publishConfig.get("HttpConfig");
global.DBManager = require(path.join(__dirname,"../../","./Helper/DBManager/DBManager.js"))(DBConfig);
global.config = merge(cfg,publishConfig.getAll());
global.config = merge(global.config,httpConfig);
global.redis = require(path.join(__dirname,"../../","./Helper/Redis/Redis.js"))(redisConfig);
global.cache = require('memory-cache');
var logClient = require(path.join(__dirname,"../../","./Helper/MsgSenderClient/MsgSenderClient.js"))(publishConfig.get("LogClient"));
logClient.run(function(err){
    if( err ){
        global.logger.error("日志服务客户端启动异常,err:", err);
    }else{
        global.logger.info("日志服务客户端启动完成");
    }
});

global.logClient = logClient ;

global.BASE_DATA_SAVE_DIR = publishConfig.get("BASE_DATA_SAVE_DIR")?publishConfig.get("BASE_DATA_SAVE_DIR"):"/wmlogs/basedata/";
var fs = require('fs');
function mkdirsSync(dirpath, mode) {
    if (!fs.existsSync(dirpath)){
        mkdirsSync(path.dirname(dirpath), mode);
        fs.mkdirSync(dirpath, mode);
    }
};

if (!fs.existsSync(global.BASE_DATA_SAVE_DIR)){
    mkdirsSync(global.BASE_DATA_SAVE_DIR);
}
// 启动 job
for(var i = 0;i < jobs.length;i ++){
    var file = path.join(__dirname,"JobProcess",jobs[i]) ;
    require(file)();
}
