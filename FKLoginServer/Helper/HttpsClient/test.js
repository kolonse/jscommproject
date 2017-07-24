var https = require("./httpsClient")({rejectUnauthorized:false});
var param = {
	access_token:"267708506244702fc0a8647e03d3d4d16319ca88faef3831bb"
}
https.get("https://openapi.360.cn:443/user/me.json",param,function(err,res){
	console.log(err);
	console.log(res);
});