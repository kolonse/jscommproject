/**
 * Created by Administrator on 2015/7/9.
 */
var errorCode = require("./ErrorCode.js");

var fs = require("fs");
var path = require("path");
/**
 * value 要进行检测的值
 * name 进行检测的值的名字
 *  校验字段是否为 undefined 如果是 那么打印日志 并且返回 true
 */
exports.isUndefined = function(value, name) {
    if (value === undefined) {
        global.logger.debug(name + " is undefined");
        return true;
    }
    return false;
}

/**
 * 用于自动遍历目录下的业务逻辑内容 并加载到 map 中
 * 目录下的业务逻辑文件 一般文件名就是一个业务名 所以必须保证业务名字和文件名一致
 * @param dir 业务逻辑所放置的目录名字
 * @param ext 业务文件的扩展名
 * @returns {{}} 返回加载后的 业务与逻辑文件的映射关系
 * @constructor
 */
exports.LoadSync = function(dir, ext) {
        var arrayDir = fs.readdirSync(dir);
        var retMap = {};
        arrayDir.forEach(function(file) {
            filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                return;
            }
            if (path.extname(file) === ext) {
                retMap[path.basename(file, ext)] = require(filePath);
            }
        });
        return retMap;
    }
    /**
     * 参数校验函数
     * @param paramList 参数列表  object eg:{ a:"int", b:"string"}
     * @param checkObject 检查对象 object
     * @constructor
     * return :  如果有错误 返回 err,否则返回 null
     */
exports.CheckParam = function(paramList, checkObject) {
    if (this.isUndefined(checkObject, "checkObject")) {
        return new Error("checkObject input error", errorCode.errorDataInput);
    }

    for (var key in paramList) {
        if (this.isUndefined(checkObject[key], key)) {
            return new Error(key + " is undefined", errorCode.errorDataInput);
        }

        if (typeof checkObject[key] !== paramList[key]) {
            return new Error(key + " is not " + paramList[key] + ",but is " + typeof checkObject[key], errorCode.errorDataFormat);
        }
    }
    return null;
}

/**
 * 将str中 char 首尾 char 元素全部去除
 * @param str
 * @param char
 * @returns {*}
 */
var Trim = function(str, char) {
        var ret = str;
        var i = 0;
        while (ret[i] === char) {
            i++;
        }
        ret = ret.substr(i);
        i = ret.length - 1;
        while (ret[i] === char) {
            i--;
        }
        return ret.substr(0, i + 1);
    }
    /*
    exports.UrlLoad = function(dir,ext){
        var arrayDir = fs.readdirSync( dir );
        var retMap = {};
        arrayDir.forEach( function(file) {
            filePath = path.join( dir, file );
            if( fs.statSync( filePath).isDirectory() ){
                return ;
            }
            if( path.extname(file) === ext){
                retMap[path.basename( file, ext)] = require( filePath );
            }
        });
        return retMap;
    }
    */

exports.CheckPhone = function(phone) {
    if (!(/^1[0-9]{10}$/.test(phone))) {
        return false;
    }
    return true;
}

exports.CheckSercuiryCode = function(code) {
    if (!(/^[0-9]{6}$/.test(code))) {
        return false;
    }
    return true;
}

var uuid = require("./uuid.js");
var md5 = require("md5");

function getRandomStr() {
    var buf = new Array(16);
    uuid.v4(null, buf, 0);
    var buff = new Buffer(16);
    for (var i = 0; i < buf.length; i++) {
        buff[i] = buf[i];
    }
    return md5(buff);
}

exports.getRandomStr = getRandomStr;