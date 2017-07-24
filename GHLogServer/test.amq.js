var ConfigLoader = require("./module/ConfigLoader/ConfigLoader.js");
var logger = require('./logger.js');
var Server = require("./module/MsgReceiveServer/MsgReceiveServer.js");
var Client = require("./module/MsgSenderClient/MsgSenderClient.js")({
	uri:"amqp://192.168.1.129"
});
var config = ConfigLoader(require("./Config/Config.js"));
// 启动消息接收器
var msgReceiverCfg = config.get("msgReceiver");
msgReceiverCfg.logger = logger ;
var server = Server(msgReceiverCfg);
var Code = require("./ErrorCode.js");
var assert = require("assert")
var rid = 0 ;
server.on("data",function(message){
	console.log(message);
	assert.equal(message.data.id,rid,"这里不想等");
	rid ++ ;
})

server.on("error",function(err){
    logger.error("数据接收服务出错,err:",err);
});


server.run();

// 服务发送
var i  = 0 ;
Client.run(function(err){
	console.log(err);
	setInterval(function(){
		Client.sendMsg("test",{id:i,t: + 432423423423423},function(err){
			console.log(err);
		});
		i ++ ;
	},1000);
})
