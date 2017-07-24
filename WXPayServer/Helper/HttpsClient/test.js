
var t = 0;
var count = 1000;
var times = 0;

for(var i =0;i < count;i ++){	
	setTimeout(function(){
		var begin = new Date().getTime();
		var param = {
			"deviceId":"",
			"system":"",
			"version":"",
			"loginAppId":(Math.floor(Math.random()*100) / 2) === 0?7:8,
			"ticket":{
				"code":"" + new Date().getTime() + Math.random()
			}
		}
		var https = require("./httpsClient")({rejectUnauthorized:false});
		https.post("https://login.youdianle.com.cn:4443/wxLogin",param,function(err,res){
			times += new Date().getTime() - begin;
			if(err){
				console.log(err);
				process.exit(-1);
				return;
			}
			t ++;
			if(t >= count){
				console.log("测试次数:",count,"消耗总时间:",times,"消耗平均时间:",times / count);
			}
		});		
	},Math.floor(Math.random() * 10000));
}

setInterval(function(){},1000);