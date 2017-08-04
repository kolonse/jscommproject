$(".k-inline-muti-checkbox").each(function(index, o) {
    var id = $(o).attr("id") || uuid.v4();
    var name = $(o).attr("name") || id;
    var label = $(o).attr("label") || "";
    $(o).attr("id", id);
    if (!config[name] || config[name] === 0) {
        $(o).css("display", "none");
        return;
    }
    var html = new KString(
            '<label>${label}</label>' +
            '<template v-for="elem in ${name}">' +
            '<label class="checkbox-inline">' +
            '<input type="checkbox" name="${name}" value="{{elem[0]}}">{{elem[1]}}' +
            '</label>' +
            '</template>'
        )
        .Set("name", name)
        .Set("label", label)
        .Get();
    $(o).html(html);
});

$(function() {
    $(".k-inline-muti-checkbox").externForm("k-inline-muti-checkbox", "-unknow-nothing-", function() {
        var obj = [];
        var id = $(this).attr("id");
        var child = $("#" + id).children(".checkbox-inline");
        if (child.length <= 0) {
            return obj;
        }
        child.children("input").each(function(i, o) {
            var v = $(o)[0];
            if (!v.checked) {
                return;
            }
            obj.push(v.value);
        });
        return obj;
    }, function(obj) {
        if (!obj) return;
        var id = $(this).attr("id");
        var child = $("#" + id).children(".checkbox-inline");
        if (child.length <= 0) {
            return obj;
        }
        for (var i = 0; i < obj.length; i++) {
            var v = obj[i];
            if (child.children("[value=" + v + "]")[0]) {
                child.children("[value=" + v + "]")[0].checked = true;
            }
        }
    });
});