/**
 * Created by Administrator on 2016/6/22.
 */
// 定义一个用户记录 filter 用户的 uid 必须要小于 30000
function Filter(){
    this.event = "userRecord" ;
}
/**
 * 检查消息  如果发现满足条件 uid < 30000  那么就返回 false,否则返回 true 表示通过
 * @param message
 * @constructor
 */
Filter.prototype.Pass = function(message){
    if(this.event !== message.event){
        return true ;
    }
    var data = message.data ;
    if(!data){
        return false ;
    }
    var uid = parseInt(data.uid);
    if(isNaN(uid)){
        return false ;
    }
    if(uid < 30000){
        return false ;
    }

    return true ;
}

module.exports = Filter ;