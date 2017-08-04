
function KString(str){
	this.str = str ;
	this.param = {} ;
	return this.parse(this.str) ;
}
// 将字符串中的变量进行粘贴出来
KString.prototype.parse = function(){
	var regex = /(?:\$\{)(.*?)(?:\})/g;
	var match = regex.exec(this.str);
	while(match != null){
		var key = this.format(match[1]) ;
		if(key === ""){
			continue ;
		}
		this.param[key] = match[0] ;
		match = regex.exec(this.str);
	}
	return this ;
}

KString.prototype.trim = function(str){
	return str.replace(/^\s*(\S+)\s*/,"$1");
}

KString.prototype.format = function(str){
	// 先转化为小写
	var ret = str.toLowerCase();
	// 将首尾空格去掉
	return this.trim(ret) ;
}

KString.prototype.Set = function(key,value){
	key = this.format(key);
	if(this.param[key] === undefined){
		// 这里不能设置该关键字 也可以直接在这里 throw 来提示出现问题
		return this ;
	}
	if(value instanceof Object){
		this.param[key] = JSON.stringify(value);
	}else{
		this.param[key] = "" + value;
	}
	return this ;
}

KString.prototype.Get = function(){
	var ret = this.str ;
	for(var key in this.param){
		var regex = new RegExp("\\$\\{\\s*" + key + "\\s*\\}","ig");
		ret = ret.replace(regex,this.param[key]);
	}
	return ret ;
}

//${propName} 充值达到 ${ count }
//console.log(new KString("充值达到 100万${propName}即可领取")
//.Set("propName","钻石")
//.Get());
module.exports=KString;