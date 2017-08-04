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
    if (cfg[id].freecard.defaultValue === "open") {
        if (parseInt(cfg[id].freecard.open.minnumofonce) > parseInt(cfg[id].freecard.open.maxnumofonce)) {
            alert("房卡赠送 【单次最小赠送数量】 不能大于 【单次最大赠送数量】");
            return;
        }
    }
    window.sessionStorage.setItem("config", JSON.stringify(cfg));
    var param = {
        id: id,
        cfg: cfg[id]
    };
    console.log(cfg[id]);
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