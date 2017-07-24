$(function() {
    $.fn.gridCheckboxShow = function() {
        var gridCheckBoxList = $(this);
        if (gridCheckBoxList && gridCheckBoxList.length > 0) {
            gridCheckBoxList.each(function(index, o) {
                var defaultSelect = $(o).attr("default") || 0;
                drawGridCheckBox(o, defaultSelect);
            });
        }
    };

    $(".grid-checkbox").gridCheckboxShow();

    function drawGridCheckBox(o, defaultSelect) {
        var wcount = $(o).attr("wcount") || 4;
        var hcount = $(o).attr("hcount") || 2;
        var width = $(o).width() || 200;
        var height = $(o).height() || 50;
        $(o).width(width);
        $(o).height(height);
        var pwidth = width / wcount;
        var pheight = height / hcount;

        var contentList = getContentList(o);
        var html = "";
        var top = 0;
        var left = 0;
        var topi = 0;
        var lefti = 0;
        // 这里确保内容数量不要超过列表数量
        if (contentList.length > wcount * hcount) {
            contentList = contentList.splice(0, wcount * hcount);
        }
        for (var i = 0; i < contentList.length; i++) {
            if (lefti >= wcount) {
                topi += 1;
                lefti = 0;
            }
            html += makeHtml(contentList[i][0], {
                width: pwidth,
                height: pheight,
                top: topi * pheight,
                left: lefti * pwidth
            }, contentList[i][1]);
            lefti += 1;
        }
        $(o).html(html + '<div class="clearfix"></div>');
        $(o).children("div.box").each(function(index, e) {
            var pdiv = $($(e).children("div")[1]);
            var p = pdiv.children("p");
            var ph = p.height();
            var top = pheight / 2 - ph / 2;
            pdiv.css("top", top + "px");
        });
        boxOnClick($($(o).children("div.box")[defaultSelect]));
    }

    function getContentList(o) {
        var childs = $(o).children("p");
        var contentList = [];
        if (childs && childs.length !== 0) {
            childs.each(function(index, v) {
                var name = $(v).attr("name") || uuid.v4();
                contentList.push([$(v).html(), name]);
            });
        }
        return contentList;
    }

    function makeHtml(text, style, name) {
        var border = '<div></div>';
        var content = new KString('<div style="width:${width}px;height:${height}px;"><p><span>${text}</span></p></div>')
            .Set("text", text)
            .Set("width", style.width)
            .Set("height", style.height)
            .Get();
        var box = new KString('<div name="${name}" class="box" onclick="boxOnClick(this)" style="width:${width}px;height:${height}px;top:${top}px;left:${left}px;">${border}${content}</div>')
            .Set("border", border)
            .Set("content", content)
            .Set("width", style.width)
            .Set("height", style.height)
            .Set("top", style.top)
            .Set("left", style.left)
            .Set("name", name)
            .Get();
        return box;
    }


    $(".grid-checkbox").externForm("grid-checkbox", "-unknow-nothing-", function() {
        var obj = "";
        var name = $(this).children(".selected").attr("name");
        obj = name;
        return obj;
    }, function(obj) {
        if (!obj) return;
        var o = $(this).children(".box:[name='" + obj + "']");
        if (o.length <= 0) {
            return;
        }
        o.addClass("selected");
    });

});

function boxOnClick(o) {
    $(o).parent().children("div.selected").children("div:first-child.selected").removeClass("selected");
    $(o).parent().children("div.selected").removeClass("selected");
    $(o).addClass("selected");
    $(o).parent().children("div.selected").children("div:first-child").addClass("selected");
    $(o).parent().children("div.selected").children("div:first-child.selected").width($(o).width());
    $(o).parent().children("div.selected").children("div:first-child.selected").height($(o).height());
}