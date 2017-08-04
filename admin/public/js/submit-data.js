var fafter = "";
$(function() {
    $(".submit-data").css("text-align", "center");
    var fstr = $(".submit-data").attr("selfonclick") || "submitData()";
    fafter = $(".submit-data").attr("successafter") || "(function(){})())";
    $(".submit-data").html('<button type="button" class="btn btn-lg btn-primary btn-block" onclick="' + fstr + '" >提交</button>');
});

function submitData() {
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
        eval(fafter);
    }
}