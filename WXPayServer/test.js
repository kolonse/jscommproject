/**
 * Created by Administrator on 2015/7/27.
 */
var assert = require("assert");
global.logger = require('./logger.js');
global.sqlManager = require("./Helper/SqlManager/SqlManager")();

global.redis = require("./Helper/Redis/Redis.js")();
var HttpClient = require("./Helper/HttpClient/HttpClient.js");
var errorCode = require("./Common/ErrorCode.js");
var commonDef = require("./Common/CommonDefine.js");
var config = require("./config/config.js");
var Promise = require("promise");
var DataManager = require("./Helper/DataManager/DataManager")();
var PayManager = require("./Helper/PayManager/PayManager")();
global.DataManager = DataManager ;
global.PayManager = PayManager ;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
describe('测试 DataManager', function(){
    describe('测试 GetAllPayType', function(){
        it("应该没有错误 且有数据",function(done){
            DataManager.GetAllPayType()
                .then(function(data){
                    console.log(data);
                    if( data ) done();
                    else done(new Error("数据为空"));
                },function(err){
                    done(err)
                })
        });

        it("第二次取数据也应该没有错误 且有数据",function(done){
            DataManager.GetAllPayType()
                .then(function(data){
                    console.log(data);
                    if( data ) done();
                    else done(new Error("数据为空"));
                },function(err){
                    done(err)
                })
        });
    });

    describe('测试 GetZFBInfo', function(){
        it("应该没有错误 且有数据",function(done){
            DataManager.GetZFBInfo()
                .then(function(data){
                    console.log(data);
                    if( data ) done();
                    else done(new Error("数据为空"));
                },function(err){
                    done(err)
                })
        });

        it("第二次取数据也应该没有错误 且有数据",function(done){
            DataManager.GetZFBInfo()
                .then(function(data){
                    console.log(data);
                    if( data ) done();
                    else done(new Error("数据为空"));
                },function(err){
                    done(err)
                })
        });
    });

    describe('测试 GetGoodsInfoById', function(){
        it("应该没有错误 且有数据",function(done){
            DataManager.GetGoodsInfoById(1)
                .then(function(data){
                    console.log(data);
                    if( data ) done();
                    else done(new Error("数据为空"));
                },function(err){
                    done(err)
                })
        });

        it("第二次取数据也应该没有错误 且有数据",function(done){
            DataManager.GetGoodsInfoById(1)
                .then(function(data){
                    console.log(data);
                    if( data ) done();
                    else done(new Error("数据为空"));
                },function(err){
                    done(err)
                })
        });
    });

    describe('测试 GetAllPayType', function(){
        it("应该没有错误 且有数据",function(done){
            DataManager.GetAllPayType()
                .then(function(data){
                    console.log(data);
                    if( data ) done();
                    else done(new Error("数据为空"));
                },function(err){
                    done(err)
                })
        });

        it("第二次取数据也应该没有错误 且有数据",function(done){
            DataManager.GetAllPayType()
                .then(function(data){
                    console.log(data);
                    if( data ) done();
                    else done(new Error("数据为空"));
                },function(err){
                    done(err)
                })
        });
    });
})

describe('测试 PayManager', function(){
    describe('测试 zfb', function(){
        it("应该没有错误 且有数据",function(done){
            PayManager.zfb({
                id:"test001",
                goodsInfo:{
                    goodsId:1
                }
            })
            .then(function(data){
                if( data ) done();
                else done(new Error("数据为空"));
            },function(err){
                    console.log(err);
                    done(err)
            })
        });
    });
})