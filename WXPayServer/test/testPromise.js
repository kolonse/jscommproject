/**
 * Created by Administrator on 2015/9/6.
 */
var assert = require("assert");
var ParamCheck = require("../Helper/ParamCheck/ParamCheck.js");
var Promise = require("promise");

describe('测试会不会走到 then', function(){
    it('不应该抛出异常', function(done){
        function a(){
            return new Promise(function(fulfill,reject){
                reject()
            });
        }
        a().then(null,function(){
            return new Promise(function(fulfill,reject){
                done();
                console.log("here");
//                reject();
            });

        }).then(function(){
            console.log("you come fulfill");
            assert("不能走到这里");
        },function(){
            console.log("you come reject");
        });
    });
});