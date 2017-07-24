/**
 * Created by Administrator on 2016/11/11.
 */
function Middle(){
    this.funcArr = [];
}

var pt = Middle.prototype;

pt.Use = function(cb){
    this.funcArr.push(cb);
}

pt.Call = function(message,end){
    if(this.funcArr.length === 0){
        end();
        return ;
    }

    var i = 0 ;
    var self = this ;
    next();
    function next(){
        if(i >= self.funcArr.length){
            end();
        }else{
            var func =  self.funcArr[i ++];
            func(message,next);
        }
    }
}

module.exports.New = function(){
    return new Middle();
}