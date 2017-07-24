var ErrorCode = require("../../Common/ErrorCode");

function Server(opt) {
    opt = opt || {};
    this.logger = opt.logger || {
        error: console.error,
        warn: console.log,
        info: console.log,
        debug: console.log
    };
    this.db = opt.db;
    this.init();
}

var pt = Server.prototype;
pt.init = function() {

};

pt.getUsers = function(cond, attr, cb) {
    if (!cb && attr instanceof Function) {
        cb = attr;
        attr = null;
    }
    if (cond instanceof Function) {
        cb = cond;
        cond = null;
        attr = null;
    }
    var param = { where: cond, attributes: attr };

    if (!attr) {
        param = { where: cond };
    }
    if (!cond) {
        param = {};
    }
    this.db.user.findAll(param)
        .then(function(data) {
            cb(null, data);
        })
        .catch(function(err) {
            cb(err);
        });
};

pt.getUserInfoBy = function(cond, attr, cb) {
    if (!cb && attr instanceof Function) {
        cb = attr;
        attr = null;
    }
    var param = { where: cond, attributes: attr };

    if (!attr) {
        param = { where: cond };
    }
    this.db.user.findOne(param)
        .then(function(data) {
            cb(null, data);
        })
        .catch(function(err) {
            cb(err);
        });
};

pt.getUserInfoByOpenid = function(openid, attr, cb) {
    if (!cb && attr instanceof Function) {
        cb = attr;
        attr = null;
    }
    var param = {
        where: {
            openid: openid
        },
        attributes: attr
    };

    if (!attr) {
        param = {
            where: {
                openid: openid
            }
        };
    }
    this.db.user.findOne(param)
        .then(function(data) {
            cb(null, data);
        })
        .catch(function(err) {
            cb(err);
        });
};

pt.getUserInfoByUnionid = function(unionid, attr, cb) {
    if (!cb && attr instanceof Function) {
        cb = attr;
        attr = null;
    }
    var param = {
        where: {
            unionid: unionid
        },
        attributes: attr
    };

    if (!attr) {
        param = {
            where: {
                unionid: unionid
            }
        };
    }
    this.db.user.findOne(param)
        .then(function(data) {
            cb(null, data);
        })
        .catch(function(err) {
            cb(err);
        });
};

pt.getUserInfoById = function(id, attr, cb) {
    if (!cb && attr instanceof Function) {
        cb = attr;
        attr = null;
    }
    var param = {
        where: {
            id: id
        },
        attributes: attr
    };

    if (!attr) {
        param = {
            where: {
                id: id
            }
        };
    }
    this.db.user.findOne(param)
        .then(function(data) {
            cb(null, data);
        })
        .catch(function(err) {
            cb(err);
        })
}

pt.storeUserInfo = function(info, cb) {
    this.db.user.create(info)
        .then(function(data) {
            cb(null);
        })
        .catch(function(err) {
            cb(err);
        });
}

pt.updateUserInfo = function(info, where, cb) {
    this.db.user.update(info, { where: where })
        .then(function(data) {
            cb(null);
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
            process.nextTick(function() { cb(null, data); });
        })
        .catch(function(err) {
            process.nextTick(function() { cb(err); });
        });
};

pt.delete = function(table, where, cb) {
    this.db[table].destroy({ where: where })
        .catch(function(err) {
            cb(err);
        });
};

pt.update = function(table, info, where, cb) {
    this.db[table].update(info, { where: where })
        .then(function() {
            cb(null);
        })
        .catch(function(err) {
            cb(err);
        });
};

module.exports = Server;