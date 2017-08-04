var cdm = null;
$(function() {
    // if ($.isChrome()) {
    //     $("#notice").attr("src", "/bbcode/BBCodeEdit.html?url=/gameparam/gamenotice.html");
    //     $("#not-chrome").css("display", "none");
    //     cdm = new CDM(window, $("#notice")[0].contentWindow, null, [window.location.origin]);
    // } else {
    //     $("#notice").css("display", "none");
    //     $("#selfsubmitdata").css("display", "none");
    // }
});

if (!window.location.origin) {
    window.location.origin = window.location.href.substr(0, window.location.href.length - window.location.pathname.length);
}

function iesubmitdata() {
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
    var title = param.noticeTitle.replace(/\[.+?\]/g, "");
    if (param.noticeTitle && title.length < 17 && title.length > 0) {
        if (param.noticeContent && param.noticeContent.length > 0) {
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
        } else {
            fail(-1, '公告内容不应该为空');
        }
    } else {
        fail(-1, '公告标题长度应该在1~17以内');
    }

    function success() {
        alert("提交成功");
        proxyData.ajax.reload();
    }
}

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

    cdm.Request("getNotice", "", window.location.origin + "/bbcode/BBCodeEdit.html", function(data) {
        var title = data.noticeTitle.replace(/\[.+?\]/g, "");
        if (data.noticeTitle && title.length < 17 && title.length > 0) {
            param.noticeTitle = data.noticeTitle;
            if (data.noticeContent && data.noticeContent.length > 0) {
                param.noticeContent = data.noticeContent;
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
            } else {
                fail(-1, '公告内容不应该为空');
            }
        } else {
            fail(-1, '公告标题长度应该在1~17以内');
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