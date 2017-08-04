var oldData = {};

function setProperty(id) {
    var cfg = window.sessionStorage.getItem("config") || "{}";
    cfg = JSON.parse(cfg);
    // 设置当前页面的数据
    oldData = cfg.selfinfo;
    if (!oldData) {
        return;
    }
    $("#updateinfo").setFormData(oldData);
}

function updateinfo() {
    var data = $("#updateinfo").getFormData();
    var diff = {};
    var has = false;
    for (var key in data) {
        if (data[key] !== oldData[key]) {
            diff[key] = data[key];
            has = true;
        }
    }
    if (!has) {
        alert("没有任何改动 不进行提交");
        return;
    }
    var param = {
        data: diff
    };
    $.post("/submitData/updateSelfinfo", param, function(result, status, obj) {
        if (status === "success") {
            if (result.code !== 0) {
                fail(result.code, result.message);
                return;
            }
            $("#updateinfo").modal("hide");
            var cfg = window.sessionStorage.getItem("config") || "{}";
            cfg = JSON.parse(cfg);
            for (var key in diff) {
                cfg.selfinfo[key] = diff[key];
            }
            window.sessionStorage.setItem("config", JSON.stringify(cfg));
            $("form").setFormData(cfg.selfinfo);
        } else {
            fail(-1, "服务异常");
        }
    });
}

function updatepassword() {
    var data = $("#updatepassword").getFormData();

    if (data.password.length < 6 || data.password.length > 18) {
        alert("密码长度在 6 ~ 18 之间");
        return;
    }

    if (data.password !== data.password2) {
        alert("2次密码不相同");
        return;
    }
    var param = {
        data: data
    };
    $.post("/submitData/updateSelfPassword", param, function(result, status, obj) {
        if (status === "success") {
            if (result.code !== 0) {
                fail(result.code, result.message);
                return;
            }
            $("#updatepassword").modal("hide");
        } else {
            fail(-1, "服务异常");
        }
    });
}