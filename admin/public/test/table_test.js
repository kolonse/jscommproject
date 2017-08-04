
config["table_1"] = {
	head:["test1","test2"],
	datas:[
		["n1","n2"]
	]
}

function onnext(o,cb){
	setTimeout(function(){
		cb([
			{
				key1:"test1",
				key2:"test2",
				key3:"test3"
			}
		]);
	},1000)	
}
function onbegin(o){
	$(o).setTableData([
		{
			key1:"test1",
			key2:"test2",
			key3:"test3"
		},{
			key1:"test1",
			key2:"test2",
			key3:"test3"
		}
	]);
}


function onfightroombegin(o){
	$(o).setTableData([
		{
			roomId:"test1",
			roomInfo:"test2",
			pcount:"test3"
		},{
			roomId:"test1",
			roomInfo:"test2",
			pcount:"test3"
		}
	]);	
}

function onfightroomnext(o,cb){
	cb([
		{
			roomId:"test1",
			roomInfo:"test2",
			pcount:"test3"
		}
	]);
}
