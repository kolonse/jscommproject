function orderSubmit() {
    var data = $("#issueorders-info").getFormData();
    if (isNaN(parseInt(data.uid))) {
        alert("需要输入合法 uid");
        return;
    }
    if (data.reason.length === 0) {
        alert("补单内容不能为空");
        return;
    }
    $.post("/submitData/orderSubmit", data, function(result, status, obj) {
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
}

function checkPlayer() {
    var data = $("#issueorders-info").getFormData();
    if (isNaN(parseInt(data.uid))) {
        alert("需要输入合法 uid");
        return;
    }
    $("#checkPlayer").setFormData({
        uid: -1,
        name: "unkown",
        room_card: 0,
        total_charge: 0,
        vip_level: 0,
        leader: 0,
        sys_flags: 0,
        last_login: "",
        create_time: "",
        unionId: ""
    });
    $(".error-tip").addClass("error-tip-show");
    $.post("/submitData/getUserByUid", { uid: data.uid }, function(result, status, obj) {
        $(".error-tip").removeClass("error-tip-show");
        if (status === "success") {
            if (result.code !== 0) {
                fail(result.code, result.message);
                return;
            }
            $("#checkPlayer").setFormData(result.data);
            $("#orderSubmit-submit").css("display", "block");
        } else {
            fail(-1, "服务异常");
        }
    });
}

function success() {
    alert("提交成功");
    $("#orderSubmit-submit").css("display", "none");
}

$(function() {
    $("#orderSubmit-submit").css("display", "none");
});