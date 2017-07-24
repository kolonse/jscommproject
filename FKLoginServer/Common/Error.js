var util = require("util");
var GHHTError = function(code, detail){
	//Error.captureStackTrace(this, this)
	Error.call(this);
	Error.captureStackTrace(this, arguments.callee);
	this.errorDetail = detail
	this.errorCode = code ;;
}

util.inherits(GHHTError, Error);
GHHTError.prototype.GetCode = function(){
	return this.errorCode;
}

GHHTError.prototype.GetDetail = function(){
	return this.errorDetail
}

module.exports = GHHTError ;