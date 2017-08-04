function selfonclick() {
    var cfg = window.sessionStorage.getItem("config") || "{}";
    cfg = JSON.parse(cfg);
    var id = window.location.pathname.replace(/\/(.+?)\..+/, "$1");
    cfg[id] = cfg[id] || {};
    $("form").each(function(i, o) {
        var obj = $(o).getFormData();
        for (var key in obj) {
            cfg[id][key] = obj[key];
        }
    });

    window.sessionStorage.setItem("config", JSON.stringify(cfg));
    var param = {
        id: id,
        cfg: cfg[id]
    };
    if (!checkFightroom(cfg[id].fightroom)) {
        return;
    }
    if (!checkGoldroom(cfg[id].goldroomtype)) {
        return;
    }
    $.post("/updateConfig", param, function(result, status, obj) {
        if (status === "success") {
            if (result.code !== 0) {
                fail(result.code, result.message);
                return;
            }
            success();
        } else {
            fail(-1, "服务异常");
        }
    });

    function success() {
        alert("保存成功");
    }
}

function checkFightroom(data) {
    if (data.defaultValue !== "open") {
        return true;
    }
    data = data.open;
    if (data.bulletcount.length !== 2) {
        alert("【子弹选择】必须选中2项");
        return false;
    }
    if (data.cannonvalue.length !== 2) {
        alert("【炮值选择】必须选中2项");
        return false;
    }
    if (data.playtype.length !== 2) {
        alert("【局数选择】必须选中2项");
        return false;
    }
    return true;
}

function checkGoldroom(data) {
    for (var k in data) {
        if (k !== "defaultValue") {
            var v = data[k];
            if (v.goldroom.defaultValue === "open") {
                var d = v.goldroom.open;
                var maxcannon = parseInt(d.maxcannon.defaultValue);
                var mincannon = parseInt(d.mincannon.defaultValue);
                var defaultcannon = parseInt(d.defaultcannon.defaultValue);
                if (!(defaultcannon >= mincannon && defaultcannon <= maxcannon)) {
                    alert("【默认炮值】必须在【最大炮值】【最小炮值】之间");
                    return false;
                }
            }
        }
    }
    return true;
}