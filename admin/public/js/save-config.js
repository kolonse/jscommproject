$(function() {
    $(".save-config").each(function(index, o) {
        $(o).css("text-align", "center");
        var fstr = $(o).attr("selfonclick") || "save()";
        $(o).html('<button type="button" class="btn btn-lg btn-primary btn-block" onclick="' + fstr + '">保存设置</button>');
    });
});

function save() {
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