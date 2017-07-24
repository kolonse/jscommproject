/**
 * Created by Administrator on 2015/9/19.
 */
/**
 * Created by Administrator on 2015/9/2.
 */
var commonFunction = require("../../Common/CommonFunction.js");
var DataManager = commonFunction.LoadSync(__dirname + "/Data", ".js");

module.exports = function() {
    return DataManager;
};