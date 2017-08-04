/**
 * Created by Administrator on 2015/7/17.
 */
//var child_process = require("child_process");



var Job = function(app) {
    //var process = child_process.fork(__dirname + "/run.js");
    var run = require(__dirname + "/run.js");
    run(app);
};

module.exports = Job;