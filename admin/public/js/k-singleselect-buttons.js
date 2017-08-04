$(".k-singleselect-buttons").each(function(index, o) {
    var id = $(o).attr("id") || uuid.v4();
    var name = $(o).attr("name") || id;
    var label = $(o).attr("label") || "";
    $(o).attr("id", id);
    var html = new KString(
            '<label for="${id}-buttons" class="control-label">${label}</label>' +
            '<div id="${id}-buttons" class="btn-group" data-toggle="buttons">' +
            '<template v-for="elem in ${name}">' +
            '<label class="btn">' +
            '<input type="radio" name="options" value="{{elem[0]}}">{{elem[1]}}' +
            '</label>' +
            '</template>' +
            '</div>'
        )
        .Set("name", name)
        .Set("label", label)
        .Set("id", id)
        .Get();
    $(o).html(html);
});

$('.btn').button();

$(function() {
    $(".k-singleselect-buttons").each(function(index, o) {
        var id = $(o).attr("id");
        $("#" + id + "-buttons").children("label").each(function(j, l) {
            $(l).children("input").change(function(e) {
                change(e.target);
            });
        });
        $($("#" + id + "-buttons").children("label")[0]).addClass("active");
    });

    $(".k-singleselect-buttons").externForm("k-singleselect-buttons", "k-singleselect-buttons-tabContent", function() {
        var obj = {};
        var id = $(this).attr("id");
        obj["defaultValue"] = $("#" + id + "-buttons").children("label.active").children("input").attr("value");
        $(this).parent().children(".k-singleselect-buttons-tabContent").children(".k-singleselect-buttons-tab-pane").each(function(i, o) {
            var name = $(o).attr("value");
            if (!name) return;
            obj[name] = $(o).getFormData();
        });
        return obj;
    }, function(obj) {
        if (!obj) return;
        var id = $(this).attr("id");
        $("#" + id + "-buttons").children("label").removeClass("active");
        $("#" + id + "-buttons").children("label").children("[value='" + obj["defaultValue"] + "']").parent().addClass("active");
        change($("#" + id + "-buttons").children("label").children("[value='" + obj["defaultValue"] + "']"));
        $(this).parent().children(".k-singleselect-buttons-tabContent").children(".k-singleselect-buttons-tab-pane").each(function(i, o) {
            var name = $(o).attr("value");
            if (!name) return;
            $(o).setFormData(obj[name]);
        });
    });

    function change(o) {
        if (o.length === 0) {
            return;
        }
        var value = $(o).attr("value");
        var bid = $(o).parent().parent().attr("id");
        var did = bid.substr(0, bid.length - "-buttons".length);
        var tabContent = $("#" + did).parent().children(".k-singleselect-buttons-tabContent");
        if (tabContent.children().length === 0) {
            return;
        }
        tabContent.children().css("display", "none");
        var v = tabContent.children("[value=" + value + "]");
        if (v) {
            tabContent.children("[value=" + value + "]").css("display", "block");
        }
    }
});