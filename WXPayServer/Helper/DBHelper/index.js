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
    }, 60 * 1000);
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

pt.read = function(table, where, attr, limit, cb) {
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
    this.db[table].findAll(param)
        .then(function(data) {
            cb(null, data);
        })
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