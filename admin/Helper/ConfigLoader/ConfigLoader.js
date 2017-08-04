/**
 * Created by Administrator on 2015/10/27.
 * 配置加载器的封装 要求配置文件必须遵循一定规范
 * 环境类型表示当前的启动环境类型 也就是 NODE_ENV=XXX  XXX表示当前运行环境
 * 如果XXX表示的环境类型在配置文件中找不到 那么就默认使用第一个
 * {
 *  环境类型1:{
 *  },
 *  环境类型2:{
 *  }
 * }
 *
 *
 */
var fs = require("fs");
var CACHE_DIR = "./cache";
if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR);
}

var ConfigLoader = function(config) {
        // 1.检查 config 类型
        this.config = null;
        this.cache = null;
        this.cacheFile = CACHE_DIR + "/config_cache.json";
        switch (checkType(config)) {
            case "String":
                this.config = this.PathLoad(config);
                break;
            case "Object":
                this.config = this.ObjectLoad(config);
                break;
            default:
                throw new Error("参数必须是 JSON 对象或者文件路径字符串");
        }
        // 开始加载缓存配置
        this.cache = this.readFromCache();
        console.info("当前缓存中配置 %j", this.cache);
        this.config = this.merge(this.config, this.cache);
    }
    /**
     * 类型检查函数 管理器只支持 String 和Object  String表示配置文件路径, Object 表示对象 都必须是 Json 格式
     * @param type
     * @returns {string}
     */
function checkType(type) {
    if (type instanceof String) {
        return "String";
    } else if (type instanceof Object) {
        return "Object";
    } else {
        return "not support";
    }
}

function getNodeENV() {
    var env = process.env.NODE_ENV;
    return env;
}

function getDefaultCfg(obj) {
    for (var key in obj) {
        return obj[key];
    }
    return {};
    //    throw new Error("配置文件内容为空 无法加载");
}

ConfigLoader.prototype.PathLoad = function(path) {
    var data = fs.readFileSync(path);
    var config = null;
    try {
        config = JSON.parse(data);
    } catch (e) {
        throw new Error(path + " 文件内容非JSON格式");
    }
    return this.ObjectLoad(config);
}

ConfigLoader.prototype.ObjectLoad = function(obj) {
    var defaultCfg = getDefaultCfg(obj);
    var env = getNodeENV();
    if (!env) {
        console.info("当前未配置 node 运行环境 将使用默认第一项配置 %j", defaultCfg);
        return defaultCfg;
    }

    if (!obj[env]) {
        console.info("当前配置 node 运行环境 %s 在配置文件中不存在,使用默认配置 %j", env, defaultCfg);
        return defaultCfg;
    }

    var cfg = obj[env];
    console.info("当前配置 node 运行环境 %s 使用配置 %j", env, cfg);
    return cfg;
}

ConfigLoader.prototype.merge = function(cfg, cache) {
    var ret = cfg;
    for (var key in cache) {
        if (!ret[key]) {
            ret[key] = {};
        }
        var value = cache[key];
        if (typeof value === "object") {
            for (var key1 in value) {
                ret[key][key1] = value[key1];
            }
        } else {
            ret[key] = value;
        }
    }
    return ret;
}

ConfigLoader.prototype.update = function(which, key, value) {
    /**
     * 写到缓存文件中
     */
    if (this.config[which] === undefined) {
        this.config[which] = {};
    }
    if (value === undefined) {
        this.config[which] = key;
    } else {
        this.config[which][key] = value;
    }
    this.saveToCache(which, key, value);
}

ConfigLoader.prototype.readFromCache = function() {
    var ret = {};
    try {
        var str = fs.readFileSync(this.cacheFile);
        ret = JSON.parse(str);
    } catch (e) {
        ret = {};
    }
    return ret;
}

ConfigLoader.prototype.saveToCache = function(which, key, value) {
    if (!this.cache) {
        this.cache = {}
    }
    if (!this.cache[which]) {
        this.cache[which] = {};
    }
    if (value === undefined) {
        this.cache[which] = key;
    } else {
        this.cache[which][key] = value;
    }
    fs.writeFileSync(this.cacheFile, JSON.stringify(this.cache));
}

ConfigLoader.prototype.get = function(which) {
    return this.config[which];
}

ConfigLoader.prototype.getAll = function() {
    return this.config;
}

ConfigLoader.prototype.clearCache = function() {
    this.cache = {};
    fs.writeFileSync(this.cacheFile, JSON.stringify(this.cache));
}

module.exports = function(config) {
    return new ConfigLoader(config);
}