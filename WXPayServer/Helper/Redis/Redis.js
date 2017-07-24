/**
 * Created by Administrator on 2015/7/23.
 * redis 内容操作
 */
var pool = require('generic-pool');
var redis = require("ioredis");

var Redis = function(cfg) {
    if (!cfg) throw new Error("must have cfg");
    var ioRedisConfig = cfg;
    this.redisPool = pool.Pool({
        name: 'redis',
        create: function(callback) {
            //var client = redis.createClient(ioRedisConfig.port, ioRedisConfig.host);
            var client = "";
            if (!ioRedisConfig.ClusterConfig) {
                if (ioRedisConfig.password) {
                    client = redis.createClient(ioRedisConfig.port, ioRedisConfig.host, { password: ioRedisConfig.password });
                } else {
                    client = redis.createClient(ioRedisConfig.port, ioRedisConfig.host);
                }
            } else {
                if (ioRedisConfig.redisOpthions) {
                    client = new redis.Cluster(ioRedisConfig.ClusterConfig, {
                        redisOpthions: ioRedisConfig.redisOpthions
                    });
                } else {
                    client = new redis.Cluster(ioRedisConfig.ClusterConfig);
                }
            }
            callback(null, client);
        },
        destroy: function(client) {
            client.disconnect();
        },
        max: ioRedisConfig.connectNum,
        idleTimeoutMillis: ioRedisConfig.idleTimeoutMillis,
        log: ioRedisConfig.log
    });
};


/**
 * set 方式存储 value
 * @param key
 * @param callback
 * @param expire 过期时间 单位 秒
 */
Redis.prototype.set = function(key, value, expire, callback) {
        if (typeof expire !== 'number' &&
            typeof callback === undefined &&
            typeof expire === 'function') {
            callback = expire;
            expire = undefined;
        }
        // 读取 redis 操作
        /**
         * 1. 先获取一个 session
         * 2.通过session 进行操作
         */
        var self = this;
        this.redisPool.acquire(function(err, client) {
            if (!!err) {
                callback(err);
                return;
            }

            client.set(key, value, function(err, reply) {
                if (expire && !err) {
                    client.expire(key, expire);
                }
                self.redisPool.release(client);
                if (err) {
                    callback(err);
                    return;
                }
                callback(null, reply);
            });
        });
    }
    /**
     * 根据关键字读取 内容
     * @param key
     * @param callback ( err, result ) 回调读取的结果
     *              result: key:result1
     */
Redis.prototype.get = function(key, callback) {
    // 读取 redis 操作
    /**
     * 1. 先获取一个 session
     * 2.通过session 进行操作
     */
    var self = this;
    this.redisPool.acquire(function(err, client) {
        if (!!err) {
            callback(err);
            return;
        }

        client.get(key, function(err, reply) {
            self.redisPool.release(client);
            callback(err, reply);
        });
    });
}

/**
 * 删除关键字
 * @param key
 * @param callback
 */
Redis.prototype.del = function(key, callback) {
    // 读取 redis 操作
    /**
     * 1. 先获取一个 session
     * 2.通过session 进行操作
     */
    var self = this;
    this.redisPool.acquire(function(err, client) {
        if (!!err) {
            callback(err);
            return;
        }

        client.del(key, function(err, res) {
            self.redisPool.release(client);
            callback(err, res);
        });
    });
}

Redis.prototype.hset = function(table, key, value, callback) {
    // 读取 redis 操作
    /**
     * 1. 先获取一个 session
     * 2.通过session 进行操作
     */
    var self = this;
    this.redisPool.acquire(function(err, client) {
        if (!!err) {
            callback(err);
            return;
        }

        client.hset(table, key, value, function(err, reply) {
            self.redisPool.release(client);
            if (err) {
                callback(err);
                return;
            }
            callback(null, reply);
        });
    });
}

Redis.prototype.hget = function(table, key, callback) {
    // 读取 redis 操作
    /**
     * 1. 先获取一个 session
     * 2.通过session 进行操作
     */
    var self = this;
    this.redisPool.acquire(function(err, client) {
        if (!!err) {
            callback(err);
            return;
        }

        client.hget(table, key, function(err, reply) {
            self.redisPool.release(client);
            callback(err, reply);
        });
    });
}

module.exports = function(cfg) {
    return new Redis(cfg);
};