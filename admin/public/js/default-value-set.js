$(function() {
    var cfg = window.sessionStorage.getItem("config") || "{}";
    cfg = JSON.parse(cfg);
    config.username = cfg.selfinfo.username;
    // 设置当前页面的数据
    var id = window.location.pathname.replace(/\/(.+?)\..+/, "$1");
    var thisConfig = cfg[id];
    if (!thisConfig) {
        return;
    }
    $("form").each(function(i, o) {
        $(o).setFormData(thisConfig);
    });
});