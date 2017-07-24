/**
 * Created by Administrator on 2015/10/27.
 * 测试用例
 */
/**
 * 注意:需要启动 apache 的ActiveMQ Server
 */
var Server = require("./module/MsgReceiveServer/MsgReceiveServer.js");
var Client = require("./module/MsgSenderClient/MsgSenderClient.js");
var ConfigLoader = require("./module/ConfigLoader/ConfigLoader.js");
var DataStoreServer = require("./module/DataStoreServer/DataStoreServer.js");
var Store = require("./module/DataStoreServer/store.js");
var DataQueryServer = require("./module/DataQueryServer/DataQueryServer.js");

function error(str){
    return new Error(str);
}

describe("测是消息发送客户端和接收服务",function(){
    it("Sever 需要收到数据",function(done){
        // 创建client
        var message = {code:1};
        var server = Server();
        server.on("data",function(data){
            if( data && data.code === 1 ){
                done();
            }else{
                done(new Error("收到数据信息不正确"));
            }
        });
        var client = Client();
        client.run(function(err){
            if(err) {done(err);return;}
            client.send(message);
        })
    })
});

describe("测试配置加载器",function(){
    describe("测试环境node运行环境未配置情况",function(){
        it("读取到的配置结果应该正确",function(done){
            var config = ConfigLoader({
                dev:{
                    id:1
                },
                test:{
                    id:2
                }
            });
            if( config.id === 1 ){
                done();
            }else{
                done(new Error("没有使用到默认配置"));
            }
        })

    });

    describe("测试环境node运行环境配置为 test 情况",function(){
        it("读取到的配置结果应该是test的配置",function(done){
            process.env.NODE_ENV="test";
            var config = ConfigLoader({
                dev:{
                    id:1
                },
                test:{
                    id:2
                }
            });
            if( config.id === 2 ){
                done();
            }else{
                done(new Error("配置没有使用到 test"));
            }
        })
    });
    describe("测试环境node运行环境配置为 test 情况 但实际不存在 test 配置",function(){
        it("读取到的配置结果应该是 dev 的配置",function(done){
            process.env.NODE_ENV="test";
            var config = ConfigLoader({
                dev:{
                    id:1
                },
                test1:{
                    id:2
                }
            });
            if( config.id === 1 ){
                done();
            }else{
                done(new Error("配置没有使用到 dev"));
            }
        })
    });
});
describe("测试数据存储服务",function(){
    var dataStroreServer = DataStoreServer();
    describe("测试 DataStoreServer.js",function(){
        describe("测试 Add",function(){
            it("存储后不应该有错误",function(done){
                dataStroreServer.Add({event:"abc",data:{a:1}})
                    .then(function(){
                        done()
                    })
                    .catch(function(e){
                        done(e)
                    });
            });
        });
        describe("测试 find",function(){
            it("查找不应该有错误",function(done){
                dataStroreServer.find("abc",{event:"abc"})
                    .then(function(result){
                        console.log(result);
                        done()
                    })
                    .catch(function(e){
                        done(e)
                    });
            });
        });
    });
});

var http = require("http");
function post(url,data,cb){
    var postData = JSON.stringify(data);
    var host = url.replace(/https?:\/\/([^\/:]+).+/,"$1");
    var port = 80;
    if( /https?:\/\/[^\/:]+:([^\/]+).+/.test(url)){
        port = url.replace(/https?:\/\/[^\/:]+:([^\/]+).+/,"$1");
    }
    var path = "/";
    if( /https?:\/\/[^\/]+(.+)/.test(url)){
        path = url.replace(/https?:\/\/[^\/]+(.+)/,"$1");
    }
    console.log(host);
    console.log(port);
    var options = {
        hostname: host,
        port: port,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length
        }
    };

    var req = http.request(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        console.log(res.headers);
        res.setEncoding('utf8');
        var data = "";
        res.on('data', function (chunk) {
            data += chunk ;
        });
        res.on('end', function() {
            cb(JSON.parse(data));
        })
    });
    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
    req.write(postData);
    req.end();
}
describe("测试数据查询服务功能",function(){
    it("测试传入参数为空情况 code 应该返回 100",function(done){
        post("http://localhost:11010/exec",{},function(data){
            if( data.code === 100 ){
                done();
            }else{
                done(new Error("没有返回 100"));
            }
        })
    });
    it("测试传入method参数为空情况 code 应该返回 100",function(done){
        post("http://localhost:11010/exec",{event:"justtest"},function(data){
            if( data.code === 100 ){
                done();
            }else{
                done(new Error("没有返回 100"));
            }
        })
    });
    it("测试count code 应该返回 0",function(done){
        post("http://localhost:11010/exec",{event:"justtest",method:"count"},function(data){
            if( data.code === 0 ){
                done();
            }else{
                done(new Error(data.message));
            }
        })
    });
    it("测试 find limit 2,code 应该返回 0",function(done){
        post("http://localhost:11010/exec",{event:"justtest",method:"find",arg:[{event:"justTest"}]},function(data){
            if( data.code === 0 ){
                console.log(data.data);
                if( data.data.length === 2 ){
                    done();
                }else{
                    done(new Error("结果不是2个数据"));
                }

            }else{
                done(new Error(data.message));
            }
        })
    });
});

describe("测试mongo裸操作",function(){
    var MongoClient = require("mongodb").MongoClient;
    var url = "mongodb://localhost/storeServer";
    it("不应该卡死",function(done){
        MongoClient.connect(url,function(err,db){
            var justtest = db.collection("justtests");
            justtest.find({}).toArray(function(err,results){
                console.log(results.length);
                done();
            });
        });
    })
})