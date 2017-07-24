/**
 * Created by Administrator on 2016/6/22.
 */

var Filter = require("./Filter.js");
function FilterManager(opt){
    opt = opt || {} ;
    this.Filters = [] ;
    this._Load();
}

FilterManager.prototype._Load = function(){
    var userRecordFilter = new Filter;
    this.Filters.push(userRecordFilter);
}


FilterManager.prototype.Pass = function(){
    for(var i = 0;i < this.Filters.length;i ++){
        var filter = this.Filters[i];
        var result = filter.Pass.apply(filter,arguments);
        if(result === false){
            return false ;
        }
    }
    return true ;
}

module.exports = FilterManager ;