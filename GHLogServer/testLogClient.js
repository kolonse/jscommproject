/**
 * Created by Administrator on 2015/10/28.
 */
var DataStoreServer = require("./module/DataStoreServer/DataStoreServer.js");
var dataStoreServer = DataStoreServer({
	uri:""
});
var moment = require("moment");
function add(cb){
	var message = {
		event:"reducerecord",
		data:{
			time:"2017-04-20 10:00:09",
			uid:"12",
			remark:"test",
			count:0
		}
	}
	dataStoreServer.Add(message)
	.then(function(){
		cb();
	})
	.catch(function(err){
		console.log(err)
		cb();
	});	
}

function go(){
	setTimeout(function(){
		add(function(){
			process.nextTick(function(){go();});
		})
	},0)	
}

go();


