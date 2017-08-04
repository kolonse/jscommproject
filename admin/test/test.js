var Server = require("../index");
var DB = require("../../DBHelper");
var DBManger = require("../../DBManager/DBManager");

var dbinst = DBManger({
    "host": "127.0.0.1",
    "port": 3306,
    "user": "root",
    "password": "123456",
    "database": "fclogin",
    "charset": "UTF8_GENERAL_CI",
    "connectNum": 10,
    "idleTimeoutMillis": 30000    
});

dbinst.user.sync().then(function(){
    var db = new DB({
        db:dbinst
    });
    var server = new Server({
        dbhelper:db,
        WX:{
            appid:"test",
            secret:"test",
            url:"https://127.0.0.1:14000/"
        }
    });
})
