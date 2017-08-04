var _ccapRandObj = {};
$(function() {
    var html = "<div style='font-size: 13px;padding-top: 12px;'>请您输入下图中的验证码：</div><a onclick='_ccapRefresh(this)' class='cimg' style='float:left;'><img style='cursor:pointer;width:138px;height:34px;display:block;' src='${ccapimg}'/></a>" +
        "<div class='ctxt' style='border-left:1px solid #e5e5e5;box-sizing:border-box;float:left'><input type='text' size=6 maxlength=6 style='height:34px;line-height:51px;width:123px;padding:0 8px;border:none;outline:none;display:block;font-family:Helvtical,microsoft yahei,sans-serif;font-size:13px;background:#ffc;' placeholder='请输入验证码'/></div>" +
        "<div style='clear:both;'></div>";
    var htmlKString = new KString(html);


    $("div.ccap").each(function(index, e) {
        var id = $(e).attr("id") || uuid.v4();
        $(e).attr("id", id);
        var rand = Math.random();
        _ccapRandObj[id] = {
            rand: rand,
            timer: _timerCapRefresh(e)
        };
        $(e).css("padding", "5px 0px");
        $(e).html(htmlKString.Set("ccapimg", "/getPassCode?rand=" + rand).Get());
    });

    $.fn.getCCapData = function() {
        var id = $(this).attr("id");
        var obj = _ccapRandObj[id];
        var txt = $($(this).children("div.ctxt").children("input")[0]).val();
        return {
            rand: obj.rand,
            txt: txt
        };
    };
    $.fn.getCCapMaxSize = function() {
        return 6;
    };
    $.fn.refreshCCap = function() {
        _ccapRefresh($(this).children("a.cimg")[0]);
    };
});

function _timerCapRefresh(o) {
    return setInterval(function() {
        _ccapRefresh($(o).children("a.cimg")[0]);
    }, 60 * 1000);
}

function _ccapRefresh(o) {
    var rand = Math.random();
    var id = $(o).parent().attr("id");
    if (_ccapRandObj[id]) {
        clearInterval(_ccapRandObj[id].timer);
    }

    _ccapRandObj[id] = {
        rand: rand,
        timer: _timerCapRefresh($(o).parent())
    };
    $($(o).children("img")[0]).attr("src", "/getPassCode?rand=" + rand);
}