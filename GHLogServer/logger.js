var log4js = require('log4js');

var MODULE_NAME="ghlogserver"
var LOG_DIR = "/wmlogs/ghlogserver/"
var LOG_FILE = LOG_DIR + MODULE_NAME;

var LEVEL = "INFO"  // 级别有 DEBUG INFO WARN ERROR
var fs = require('fs');
var path = require("path");
function mkdirsSync(dirpath, mode) {
    if (!fs.existsSync(dirpath)){
        mkdirsSync(path.dirname(dirpath), mode);
        fs.mkdirSync(dirpath, mode);
    }
};
if (!fs.existsSync(LOG_DIR)){
    mkdirsSync(LOG_DIR);
}

log4js.configure({
    appenders: [
        {
            type: 'dateFile',
            filename: LOG_FILE,
            maxLogSize: 52428800,
            backups:4,
            category: MODULE_NAME ,
            pattern: "-yyyy-MM-dd-hh.log",
            alwaysIncludePattern: true
        },
        {
            type: 'console'
        }
    ],
  replaceConsole: false
});

var logger = log4js.getLogger(MODULE_NAME);
logger.setLevel(LEVEL)


exports.debug = function(){
    arguments[0] = "[pid:"+ process.pid + "] " + arguments[0] ;
	logger.debug.apply( logger,arguments )
}

exports.info = function(){
    arguments[0] = "[pid:"+ process.pid + "] " + arguments[0] ;
    logger.info.apply( logger,arguments )
}

exports.warn=function(){
    arguments[0] = "[pid:"+ process.pid + "] " + arguments[0] ;
    logger.warn.apply(logger, arguments )
}

exports.error=function(){
    arguments[0] = "[pid:"+ process.pid + "] " + arguments[0] ;
    logger.error.apply(logger, arguments )
}

this.debug("logger load completed");