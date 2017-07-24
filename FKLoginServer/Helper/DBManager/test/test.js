/**
 * Created by Administrator on 2015/9/30.
 */
var config =        {
    fishdb:{
        "host" 				:	"121.42.214.167",
        "port" 				:	3306,
        "user"  			    :	"admin",
        "password" 			:	"123456",
        "database" 			:	"fishdb",
        "charset" 			    :	"UTF8_GENERAL_CI",
        "connectNum"		    : 	10,
        "idleTimeoutMillis"	: 	30000
    }
}
var dbmanager = require("../DBManager.js")(config);

describe('test DBManager', function(){
    it('应该没有错误', function(done){
        dbmanager.userinfo.findAll({where:["uid < ?",30000]})
            .then(function(projects){
                console.log(projects);
                done();
            }).catch(function(err){
                console.log("have err:");
                console.log(err);
                done(err);
            })
    });
});