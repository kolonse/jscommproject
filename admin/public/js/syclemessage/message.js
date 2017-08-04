function selfsubmitdata() {
    if (!timeFormat()) {
        return;
    }
    var param = {};
    var id = window.location.pathname.replace(/.+\/(.+)\.html/, "$1");
    $("form").each(function(i, o) {
        var obj = $(o).getFormData();
        for (var key in obj) {
            param[key] = obj[key];
        }
    });
    $.post("/submitData/" + id, param, function(result, status, obj) {
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
        alert("提交成功");
        proxyData.ajax.reload();
    }
}

function timeFormat() {
    var obj = $("#datetime-newnotice").getFormData();
    var from = moment(obj.from);
    if (!from.isValid()) {
        alert("播报【开始时间】格式不正确");
        return false;
    }
    var to = moment(obj.to);
    if (!to.isValid()) {
        alert("播报【结束时间】格式不正确");
        return false;
    }
    from = from.format("YYYY-MM-DDTHH:mm:ss");
    to = to.format("YYYY-MM-DDTHH:mm:ss");
    if (to <= from) {
        alert("播报【结束时间】应该大于【开始时间】格式不正确");
        return false;
    }
    return true;
}

$(function() {
    $("input[type='datetime-local'][name='from']").val(moment().add(10, "m").format("YYYY-MM-DDTHH:mm:ss"));
    $("input[type='datetime-local'][name='to']").val(moment().add(10, "m").add(1, "d").format("YYYY-MM-DDTHH:mm:ss"));
});