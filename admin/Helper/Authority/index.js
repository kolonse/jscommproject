var auth = require("../../config/authorityConfig.js");

function updateConfig(app) {
    this.keys = {};
    this.push = function(k, v) {
        this.keys[k] = v;
    };
    this.call = function(req, res, next) {
        if (this.keys[req.body.id]) {
            next();
            return;
        }
        res.json({
            code: app.ErrorCode.errorAuth,
            message: "无权限操作"
        });
    };
}

function general(app) {
    this.keys = {};
    this.getData = "/getData";
    this.submitData = "/submitData";
    this.push = function(k, v) {
        this.keys[k] = v;
    };
    this.call = function(req, res, next) {
        var p = req.path;
        if (this.keys[p] === true) {
            next();
            return;
        }
        if (p.substr(0, this.getData.length) === this.getData && this.keys[p] === false) {
            res.json({
                "draw": parseInt(req.body.draw),
                "error": "无权限操作"
            });
            return;
        } else if (p.substr(0, this.submitData.length) === this.submitData && this.keys[p] === false) {
            res.json({
                code: app.ErrorCode.errorAuth,
                message: "无权限操作"
            });
            return;
        }
        next();
    };
}

function middleware(app) {
    var authpower = {};
    var reg = /^\/(getData|submitData|updateConfig)/;

    function load(vauth, pdiy) {
        var obj = {
            "/updateConfig": new updateConfig(app)
        };
        if (pdiy && pdiy.length !== 0) {
            try {
                pdiy = JSON.parse(pdiy);
            } catch (e) {
                pdiy = null;
            }
        } else {
            pdiy = null;
        }

        var gl = new general(app);
        var push = null;
        push = function(o, flag) {
            if (!o) {
                return;
            }
            for (var key in o) {
                var p = o[key].path;
                if (p) {
                    if (obj[p]) {
                        obj[p].push(o[key].id, flag ? o[key].value : false);
                    } else {
                        gl.push(p, flag ? o[key].value : false);
                    }
                }
                if (o[key].child) {
                    if (flag) {
                        push(o[key].child, o[key].value);
                    } else {
                        push(o[key].child, false);
                    }
                }
            }
        };
        var pushdiy = null;
        pushdiy = function(va, vp, flag) {
            if (!vp) {
                return;
            }
            for (var key in vp) {
                if (!va[key]) {
                    continue;
                }
                var p = va[key].path;
                if (p) {
                    if (obj[p]) {
                        obj[p].push(va[key].id, flag ? vp[key].value : false);
                    } else {
                        gl.push(p, flag ? vp[key].value : false);
                    }
                }
                if (vp[key].child) {
                    if (flag) {
                        pushdiy(va[key].child, vp[key].child, vp[key].value);
                    } else {
                        pushdiy(va[key].child, vp[key].child, false);
                    }
                }
            }
        };
        if (vauth) {
            push(vauth, true);
        }
        if (pdiy) {
            pushdiy(vauth, pdiy, true);
        }
        return {
            obj: obj,
            gl: gl
        };
    }
    var authmark = {};

    function loadAdmin(v) {
        authpower[v.username] = load(auth[v.power], v.powerdiy);
        authmark[v.username] = {
            power: auth[v.power],
            powerdiy: {}
        };
        if (v.powerdiy && v.powerdiy.length !== 0) {
            try {
                v.powerdiy = JSON.parse(v.powerdiy);
            } catch (e) {
                v.powerdiy = null;
            }
        } else {
            v.powerdiy = null;
        }
        authmark[v.username].powerdiy = v.powerdiy;
    }

    function loadMangerInfo() {
        app.dbhelper.read("user", {}, ["username", "power", "powerdiy"], function(err, results) {
            if (err) {
                throw err;
            }
            for (var i = 0; i < results.length; i++) {
                var v = results[i].dataValues;
                loadAdmin(v);
            }
        });
    }
    loadMangerInfo();
    return function(req, res, next) {
        req.updateauth = function(v, o) {
            loadAdmin({
                username: v.username,
                power: v.power,
                powerdiy: o
            });
        };
        req.readauth = function(admin) {
            return authmark[admin];
        };
        req.reloadadmin = function(v) {
            loadAdmin({
                username: v.username,
                power: v.power,
                powerdiy: ""
            });
        };
        if (!reg.test(req.path)) {
            next();
            return;
        }
        var p = req.path;
        var admin = req.fcadmin;
        if (!authpower[admin]) {
            next();
            return;
        }
        var obj = authpower[admin].obj;
        var gl = authpower[admin].gl;
        if (obj[p]) {
            return obj[p].call(req, res, next);
        } else {
            return gl.call(req, res, next);
        }
    };
}


module.exports = middleware;