/**
 * Created by Administrator on 2016/11/11.
 */
var middle = require("./Middle").New();
middle.Use(function(message,next){
    console.log("1",message);
    next();
})

middle.Use(function(message,next){
    console.log("2",message);
    next();
})
middle.Call("test",function(){
    console.log("hhe")
})