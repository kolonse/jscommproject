/**
 * Created by Administrator on 2015/9/2.
 */
/**
 * Created by Administrator on 2015/7/27.
 */
var assert = require("assert");
var ParamCheck = require("../Helper/ParamCheck/ParamCheck.js");

describe('参数 title 参数校验', function(){
    it('title 参数为空情况 应该返回失败', function(done){
        var reqData = {
            title:""
        }
        ParamCheck().Check(reqData,['title'])
            .then(function(){
                throw new Error("不应该出现成功的回调");
            },function(value){
                done();
            });
    });

    it('title 正常 应该返回成功', function(done){
        var reqData = {
            title:"佛挡杀佛拉萨方可考虑到附近"
        }
        ParamCheck().Check(reqData,['title'])
            .then(function(){
                done();
            },function(value){
                throw new Error("正常值却回调到错误");
            });
    });
});

describe('参数 contact 参数校验', function(){
    it('contact 为QQ号检测 应该返回成功', function(done){
        var reqData = {
            contact:{
                contactType:"QQ号",
                contactTypeValue:"867594819"
            }
        }
        ParamCheck().Check(reqData,['contact'])
            .then(function(){

                done();
            },function(){
                throw new Error("不应该出现成功的回调");
            });
    });
});