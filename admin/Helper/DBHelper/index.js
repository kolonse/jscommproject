function Server(opt) {
    opt = opt || {};
    this.logger = opt.logger || {
        error: console.error,
        warn: console.log,
        info: console.log,
        debug: console.log
    };
    this.db = opt.db;
    this.mem = {};
    this.init();
}

var pt = Server.prototype;
pt.init = function() {
    var self = this;
    this.timer = setInterval(function() {
        for (var key in self.mem) {
            var v = self.mem[key];
            var cTime = new Date().getTime();
            if (cTime - v.begin > v.expire) {
                delete self.mem[key];
            }
        }
    }, 10 * 1000);
};

pt.readUserInfo = function(names, attr, cb) {
    if (names instanceof Function) {
        cb = names;
        names = {};
        attr = [];
    } else if (cb === undefined && attr instanceof Function) {
        cb = attr;
        attr = [];
    }

    var param = { where: names, attributes: attr };
    if (attr.length === 0) {
        param = { where: names };
    }
    this.db.user.findOne(param)
        .then(function(data) {
            if (data) {
                process.nextTick(function() { cb(null, data.dataValues); });
                return;
            }
            process.nextTick(function() { cb(null, null); });
        })
        .catch(function(e) {
            process.nextTick(function() { cb(e); });
        });
};

pt.writeUserInfo = function(data, names, cb) {
    this.db.user.update(data, { where: names })
        .then(function() {
            process.nextTick(function() { cb(null); });
        })
        .catch(function(e) {
            process.nextTick(function() { cb(e); });
        });
};

pt.readDataInfo = function(names, attr, cb) {
    if (names instanceof Function) {
        cb = names;
        names = {};
        attr = [];
    } else if (cb === undefined && attr instanceof Function) {
        cb = attr;
        attr = [];
    }

    this.db.data.findOne({ where: names, attributes: attr })
        .then(function(data) {
            if (data) {
                process.nextTick(function() { cb(null, data.dataValues); });
                return;
            }
            process.nextTick(function() { cb(null, null); });
        })
        .catch(function(e) {
            process.nextTick(function() { cb(e); });
        });
};

pt.writeToken = function(token, value, expire, cb) {
    if (expire instanceof Function) {
        cb = expire;
        expire = 1 * 3600 * 1000; // 1 小时
    }
    this.mem[token] = {
        v: value,
        expire: expire,
        begin: new Date().getTime()
    };
    cb(null);
};

pt.readToken = function(token, cb) {
    var v = this.mem[token];
    cb(null, v);
};

pt.deleteToken = function(token, cb) {
    delete this.mem[token];
    cb(null);
};

pt.createProxy = function(info, cb) {
    this.db.proxy.create(info)
        .then(function() {
            cb(null);
        })
        .catch(function(err) {
            cb(err);
        });
};

pt.updateProxy = function(info, where, cb) {
    this.db.proxy.update(info, { where: where })
        .then(function() {
            cb(null);
        })
        .catch(function(err) {
            cb(err);
        });
};

pt.readProxy = function(where, attr, limit, cb) {
    if (!cb && limit instanceof Function) {
        cb = limit;
        limit = null;
    }

    if (!cb && attr instanceof Function) {
        cb = attr;
        attr = null;
        limit = null;
    }
    if (attr.length === 0) {
        attr = null;
    }
    var param = { where: where };
    if (attr) {
        param.attributes = attr;
    }
    if (limit) {
        param.offset = limit[0];
        if (limit[1] !== null && limit[1] !== undefined) {
            param.limit = limit[1];
        }
    }
    this.db.proxy.findAll(param)
        .then(function(data) {
            cb(null, data);
        })
        .catch(function(err) {
            cb(err);
        });
};

pt.readUnion = function(where, attr, limit, cb) {
    if (!cb && limit instanceof Function) {
        cb = limit;
        limit = null;
    }

    if (!cb && attr instanceof Function) {
        cb = attr;
        attr = null;
        limit = null;
    }
    if (attr.length === 0) {
        attr = null;
    }
    var param = { where: where };
    if (attr) {
        param.attributes = attr;
    }
    if (limit) {
        param.offset = limit[0];
        if (limit[1] !== null && limit[1] !== undefined) {
            param.limit = limit[1];
        }
    }
    this.db.union.findAll(param)
        .then(function(data) {
            cb(null, data);
        })
        .catch(function(err) {
            cb(err);
        });
};

pt.readUnioner = function(where, attr, limit, cb) {
    if (!cb && limit instanceof Function) {
        cb = limit;
        limit = null;
    }

    if (!cb && attr instanceof Function) {
        cb = attr;
        attr = null;
        limit = null;
    }
    if (attr.length === 0) {
        attr = null;
    }
    var param = { where: where };
    if (attr) {
        param.attributes = attr;
    }
    if (limit) {
        param.offset = limit[0];
        if (limit[1] !== null && limit[1] !== undefined) {
            param.limit = limit[1];
        }
    }
    this.db.unioner.findAll(param)
        .then(function(data) {
            cb(null, data);
        })
        .catch(function(err) {
            cb(err);
        });
};

pt.create = function(table, info, cb) {
    this.db[table].create(info)
        .then(function() {
            cb(null);
        })
        .catch(function(err) {
            cb(err);
        });
};

pt.createNotice = function(info, cb) {
    this.create("notice", info, cb);
};

pt.read = function(table, where, attr, limit, sort, cb) {
    if (!cb && sort instanceof Function) {
        cb = sort;
        sort = null;
    }
    if (!cb && limit instanceof Function) {
        cb = limit;
        limit = null;
    }

    if (!cb && attr instanceof Function) {
        cb = attr;
        attr = null;
        limit = null;
    }
    if (attr && attr.length === 0) {
        attr = null;
    }
    var param = { where: where };
    if (attr) {
        param.attributes = attr;
    }
    if (limit) {
        param.offset = limit[0];
        if (limit[1] !== null && limit[1] !== undefined) {
            param.limit = limit[1];
        }
    }
    if (sort) {
        param.order = sort;
    }
    this.db[table].findAll(param)
        .then(function(data) {
            cb(null, data);
        })
        .catch(function(err) {
            cb(err);
        });
};

pt.readNotice = function(where, attr, limit, cb) {
    this.read("notice", where, attr, limit, cb);
};

pt.update = function(table, info, where, cb) {
    this.db[table].update(info, { where: where })
        .then(function(data) {
            cb(null, data);
        })
        .catch(function(err) {
            cb(err);
        });
};

pt.updateNotice = function(info, where, cb) {
    this.update("notice", info, where, cb);
};

pt.createSyscleMessage = function(info, cb) {
    this.create("unTimeCycleMessage", info, cb);
};

pt.readSyscleMessage = function(where, attr, limit, cb) {
    this.read("unTimeCycleMessage", where, attr, limit, cb);
};

pt.updateSyscleMessage = function(info, where, cb) {
    this.update("unTimeCycleMessage", info, where, cb);
};

pt.createIssueorders = function(info, cb) {
    this.create("issueorder", info, cb);
};

pt.createGameApp = function(info, cb) {
    this.create("gameapp", info, cb);
};

pt.readUnioner = function(where, attr, limit, cb) {
    this.read("unioner", where, attr, limit, cb);
};

pt.count = function(table, where, cb) {
    this.db[table].count({ where: where })
        .then(function(data) {
            cb(null, data);
        })
        .catch(function(err) {
            cb(err);
        });
};

pt.sum = function(table, colume, where, cb) {
    this.db[table].sum(colume, { where: where })
        .then(function(data) {
            cb(null, data);
        })
        .catch(function(err) {
            cb(err);
        });
};

pt.delete = function(table, where, cb) {
    this.db[table].destroy({ where: where })
        .then(function() {
            cb(null);
        })
        .catch(function(err) {
            cb(err);
        });
};

module.exports = Server;