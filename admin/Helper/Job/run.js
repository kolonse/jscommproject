/**
 * Created by Administrator on 2015/7/17.
 */
var commonFunc = require("../../Common/CommonFunction.js");
/**
 * @2015.8.11 by zjs
 * 增加 JOB 配置 用于在多机部署时避免一个JOB 被多个服务运行
 */
var DEFAULT_JOB_COUNT_OF_PROCESS = 1;
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var child_process = require("child_process");
var path = require("path");
var fs = require("fs");
var os = require("os");

function PIDHelper() {
    this.file = path.join(__dirname, "child_process.pid");
    this.pids = {};

}
PIDHelper.prototype.kill = function() {
    if (!fs.existsSync(this.file)) {
        return;
    }
    var pidStr = fs.readFileSync(this.file);
    var pids = null;
    try {
        pids = JSON.parse(pidStr);
    } catch (e) {
        return;
    }
    for (var id in pids) {
        var pid = pids[id];
        if (/win32/.test(os.platform())) {
            child_process.spawn("taskkill", ["/F", "/PID", pid, "/T"]);
        } else {
            child_process.spawn("kill", ["-9", pid]);
        }
    }
};

PIDHelper.prototype.update = function(id, pid) {
    this.pids[id] = pid;
    return this;
};

PIDHelper.prototype.save = function() {
    fs.writeFileSync(this.file, JSON.stringify(this.pids));
    return this;
};

var pidHelper = new PIDHelper();
pidHelper.kill();

function Process(opt) {
    opt = opt || {};
    this.NODE_ENV = process.env.NODE_ENV || "none";
    this.id = opt.id;
    this.jobs = opt.jobs;
    if (!this.jobs || this.jobs.length === 0) {
        throw new Error("没有传入要进行的任务");
    }
    this._ToParam = function() {
        var params = "";
        for (var i = 0; i < this.jobs.length; i++) {
            params += this.jobs[i];
            if (i != this.jobs.length - 1) {
                params += ",";
            }
        }
        return params;
    }
    var self = this;
    this.handle = child_process.spawn("node", ["--expose-gc", path.join(__dirname, "./childProcess.js"), "--files=" + this._ToParam(), "--env=" + this.NODE_ENV], { stdio: 'inherit' });
    this.handle.on("exit", function(code) {
        self.emit("exit", self, code);
    });

    this.GetHandle = function() {
        return this.handle;
    };
    EventEmitter.call(this);
}

util.inherits(Process, EventEmitter);

function ChildProcessManager(opt) {
    opt = opt || {};
    this.jobMap = commonFunc.LoadSync(__dirname + "/JobProcess", ".js");
    this.jobCountOfProcess = opt.jobCountOfProcess || DEFAULT_JOB_COUNT_OF_PROCESS;
    this.process = [];
    this.bExit = false;
    this.Exit = function() {
        this.bExit = true;
        for (var i = 0; i < this.process.length; i++) {
            //            this.process[i].GetHandle().exit();
            //			child_process.spawn("kill",["-9",this.process[i].GetHandle().pid])
            this.process[i].GetHandle().kill();
        }
    };
    var exit = function(handle, code) {
        global.logger.error("子进程 [pid:%s jobs:%j] 退出,code:%s", handle.GetHandle().pid, handle.jobs, code);
        if (!self.bExit) {
            setTimeout(function() {
                if (!self.bExit) {
                    self.process[handle.id] = create({
                        id: handle.id,
                        jobs: handle.jobs
                    });
                    pidHelper.update(handle.id, self.process[handle.id].GetHandle().pid);
                    pidHelper.save();
                }
            }, 5000);
        }
    };
    var create = function(opt) {
        var process = new Process({
            id: opt.id,
            jobs: opt.jobs
        });
        process.on("data", function(handle, data) {
            console.log(data.toString());
        });
        process.on("exit", exit);
        return process;
    };
    this.Run = function() {
        var self = this;
        var jobAll = Object.keys(this.jobMap);
        //        var processCount = Math.ceil(jobAll.length /  this.jobCountOfProcess);
        for (var i = 0; i < jobAll.length;) {
            var _off = 0;
            var jobs = [];

            if (i + this.jobCountOfProcess < jobAll.length) {
                jobs = jobAll.slice(i, i + this.jobCountOfProcess);
                _off = this.jobCountOfProcess;
            } else {
                jobs = jobAll.slice(i, jobAll.length);
                _off = jobAll.length - i;
            }

            var child = create({
                id: i,
                jobs: jobs
            });
            pidHelper.update(i, child.GetHandle().pid);
            this.process.push(child);
            global.logger.info("启动子进程 [pid:%s]", child.GetHandle().pid);
            i += _off;
        }
        pidHelper.save();
    };
    EventEmitter.call(this);
}

util.inherits(ChildProcessManager, EventEmitter);
//

module.exports = function(app) {
    var jobMap = commonFunc.LoadSync(__dirname + "/JobDir", ".js");
    for (var key in jobMap) {
        jobMap[key](app);
    }

    // var childs = new ChildProcessManager();
    // childs.Run();
    // process.on('exit', function() {
    //     childs.Exit();
    // });
};