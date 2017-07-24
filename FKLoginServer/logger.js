var log4js = require('log4js');

var MODULE_NAME = "ghloginserver";
var LOG_DIR = "/var/wmc/logs/"
var LOG_FILE = LOG_DIR + MODULE_NAME;
/***
 * 请求花费时间统计日志输出文件记录
 * @type {exports}
 */
var TIME_COST_LOG_MODULE_NAME = MODULE_NAME + " time cost";
var TIME_COST_LOG_DIR = "/var/wmc/logs/timeCostLogs/";
var TIME_COST_LOG_FILE = TIME_COST_LOG_DIR + TIME_COST_LOG_MODULE_NAME;

var LEVEL = "DEBUG" // 级别有 DEBUG INFO WARN ERROR
var fs = require('fs');
var path = require("path");

function mkdirsSync(dirpath, mode) {
    if (!fs.existsSync(dirpath)) {
        mkdirsSync(path.dirname(dirpath), mode);
        fs.mkdirSync(dirpath, mode);
    }
};
if (!fs.existsSync(LOG_DIR)) {
    mkdirsSync(LOG_DIR);
}

if (!fs.existsSync(TIME_COST_LOG_DIR)) {
    mkdirsSync(TIME_COST_LOG_DIR);
}


log4js.configure({
    appenders: [{
            type: 'dateFile',
            filename: LOG_FILE,
            maxLogSize: 52428800,
            backups: 4,
            category: MODULE_NAME,
            pattern: "-yyyy-MM-dd-hh.log",
            alwaysIncludePattern: true
        },
        {
            type: 'dateFile',
            filename: TIME_COST_LOG_FILE,
            maxLogSize: 52428800,
            backups: 4,
            category: TIME_COST_LOG_MODULE_NAME,
            pattern: "-yyyy-MM-dd-hh.log",
            alwaysIncludePattern: true
        },
        {
            type: 'console'
        }
    ],
    replaceConsole: true
});

var logger = log4js.getLogger(MODULE_NAME);
logger.setLevel(LEVEL)


exports.debug = function() {
    logger.debug.apply(logger, arguments)
}

exports.info = function() {
    logger.info.apply(logger, arguments)
}

exports.warn = function() {
    logger.warn.apply(logger, arguments)
}

exports.error = function() {
    logger.error.apply(logger, arguments)
}


var timeCostLogger = log4js.getLogger(TIME_COST_LOG_MODULE_NAME);
timeCostLogger.setLevel("INFO");

exports.Cost = function() {
    timeCostLogger.info.apply(timeCostLogger, arguments)
}

this.debug("logger load completed");