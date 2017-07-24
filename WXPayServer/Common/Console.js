var me = module.exports;

function intfmt(pad, leaf, v) {
    v = parseInt(v);
    if (isNaN(v)) {
        return "NaN";
    }
    if (leaf === -1) {
        return v.toString();
    }
    if (v.toString().length >= leaf) {
        return v.toString().substr(v.toString().length - leaf);
    }
    if (pad === -1) {
        pad = ' ';
    }
    var r = "";
    for (var i = 0; i < leaf - v.toString().length; i++) {
        r += pad.toString();
    }
    return r + v.toString();
}

function check(fmt, i, r, v, cb) {
    var c = fmt[i + 1];
    if (c === 'd') {
        cb(i + 2, r + intfmt(-1, -1, v));
        return;
    } else if (c >= '0' && c <= '9') {
        var n = fmt[i + 2];
        if (n === 'd') {
            cb(i + 3, r + intfmt(-1, parseInt(c), v));
            return;
        } else if (n >= '0' && n <= '9') {
            t = fmt[i + 3];
            if (t !== 'd') { // 目前只支持整型数字
                throw new Error("目前只支持数字格式化");
            }
            cb(i + 4, r + intfmt(parseInt(c), parseInt(n), v));
            return;
        }
    }
    // throw new Error("目前只支持数字格式化");
    cb(i, r);
    return;
}

me.sprintf = function(fmt) {
    var r = "";
    var flag = 1;
    for (var i = 0; i < fmt.length;) {
        if (fmt[i] === '%') {
            var j = i;
            check(fmt, i, r, arguments[flag], function(id, s) {
                j = id;
                r = s;
            });
            if (i < j) {
                flag++;
                i = j;
                continue;
            }
        }
        r += fmt[i];
        i++;
    }
    return r;
};