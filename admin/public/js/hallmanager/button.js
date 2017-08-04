$(function() {
    var cfg = window.sessionStorage.getItem("config") || "{}";
    cfg = JSON.parse(cfg);
    var id = window.location.pathname.replace(/\/(.+?)\..+/, "$1");
    var d = cfg[id];
    if (!d) {
        return;
    }
    if (parseInt(d.hallstatus.defaultValue) === 2) {
        var st = d.hallstatus.time;
        showTime(st);
    } else {
        $("#setting").css("display", "block");
        $("#showtime").css("display", "none");
    }
});

function savestatus() {
    var cfg = window.sessionStorage.getItem("config") || "{}";
    cfg = JSON.parse(cfg);
    var id = window.location.pathname.replace(/\/(.+?)\..+/, "$1");
    cfg[id] = cfg[id] || {};
    $("form").each(function(i, o) {
        var obj = $(o).getFormData();
        for (var key in obj) {
            cfg[id][key] = obj[key];
            cfg[id][key].time = new Date().getTime() + 30 * 60 * 1000;
        }
    });
    window.sessionStorage.setItem("config", JSON.stringify(cfg));
    var param = {
        id: id,
        cfg: cfg[id]
    };
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
        var d = cfg[id];
        if (parseInt(d.hallstatus.defaultValue) === 2) {
            var st = d.hallstatus.time;

            showTime(st);
        }
        alert("保存成功");
    }
}

function cancelmaintain() {
    var cfg = window.sessionStorage.getItem("config") || "{}";
    cfg = JSON.parse(cfg);
    var id = window.location.pathname.replace(/\/(.+?)\..+/, "$1");
    cfg[id] = cfg[id] || {};
    cfg[id] = {
        hallstatus: {
            defaultValue: "0"
        }
    };
    window.sessionStorage.setItem("config", JSON.stringify(cfg));
    var param = {
        id: id,
        cfg: cfg[id]
    };
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
        $("#setting").css("display", "block");
        $("#showtime").css("display", "none");
        $("form").setFormData(cfg[id]);
    }
}

var globalTimer = null;

function showTime(time) {
    if (!time) {
        return;
    }
    if (!moment(time).isValid()) {
        return;
    }
    $("#setting").css("display", "none");
    $("#showtime").css("display", "block");
    if (globalTimer) {
        clearInterval(globalTimer);
        globalTimer = null;
    }
    globalTimer = setInterval(function() {
        var second = time - new Date().getTime();
        $("#time").text("服务器将在 " + Math.floor(second / 60000) + " 分 " + Math.floor((second % 60000) / 1000) + " 秒 进入维护状态");
    }, 1000);
}