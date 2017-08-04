function registerGameApp() {
    var param = $("#registerForm").getFormData();
    param.gameId = parseInt(param.gameId.defaultValue);
    $.post("/register/gameapp", param, function(result, status, obj) {
        if (status === "success") {
            if (result.code !== 0) {
                fail(result.code, result.message);
                return;
            }
            success(result.data);
        } else {
            fail(-1, "服务异常");
        }
    });

    function success(data) {
        $("#registerResult").setFormData(data);
        $("#registerResult").children("h3").html("注册游戏完成,需要记住您的游戏 id");
        $("#registerResultModal").modal("show");
    }
}