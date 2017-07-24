
/**
 * wx token 管理器
 * opt:{
 *  redis:{
 *      function get(key,function(err,value){})
 *      function set(key,value,function(err){})
 *      function del(key,function(err){})
 * }
 * }
 */

function Store(opt){
    this.store = opt.store ;
    if(!opt.store){
        throw new Error("需要有 store 实例");
    }
    if(!opt.store.set instanceof Function){
        throw new Error("store 需要有 set 方法");
    }
    if(!opt.store.get instanceof Function){
        throw new Error("store 需要有 get 方法");
    }
    if(!opt.store.get instanceof Function){
        throw new Error("store 需要有 get 方法");
    }
}

var pt = TokenManager.prototype;

pt.set = function(key,value,cb){

}

pt.get = function(key,value,cb){

}

pt.del = function(key,value,cb){

}