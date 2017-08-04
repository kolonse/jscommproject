$(".k-option").each(function(index, o) {

    var id = $(o).attr("id") || uuid.v4();
    var name = $(o).attr("name") || id;
    var label = $(o).attr("label") || "";
    $(o).attr("id", id);
    var html = new KString(
            '<label for="${id}-select">${label}:</label>' +
            '<div class="" id="${id}-select" style="display:inline-block;"> ' +
            '<select name="${name}" class="form-control">' +
            '<template v-for="elem in ${name}">' +
            '<option value={{elem[0]}}>{{elem[1]}}</option>' +
            '</template>' +
            '</select>' +
            '</div>'
        )
        .Set("name", name)
        .Set("label", label)
        .Set("id", id)
        .Get();

    if ($.isIE()) {
        var labelDom = document.createElement("label");
        labelDom.setAttribute("for", id + "-select");
        labelDom.innerHTML = label + ":";
        var div = document.createElement("div");
        div.setAttribute("id", id + "-select");
        div.setAttribute("style", "display:inline-block;");
        var select = document.createElement("select");
        select.setAttribute("name", name);
        select.setAttribute("class", "form-control");
        var template = document.createElement("template");
        template.setAttribute("v-for", "elem in " + name);
        var option = document.createElement("option");
        option.setAttribute("value", "{{elem[0]}}");
        option.innerHTML = "{{elem[1]}}";
        template.appendChild(option);
        select.appendChild(template);
        div.appendChild(select);
        $(o)[0].appendChild(labelDom);
        $(o)[0].appendChild(div);
    } else {
        $(o).html(html);
    }
});

$(function() {
    $(".k-option").each(function(index, o) {
        var id = $(o).attr("id");
        $("#" + id + "-select").children("select").change(function(e) {
            change(e.target);
        });
    });
    $(".k-option").externForm("k-option", "k-option-tabContent", function() {
        var obj = {};
        var id = $(this).attr("id");
        obj.defaultValue = $($("#" + id + "-select").children("select")[0]).val();
        $(this).parent().children(".k-option-tabContent").children().each(function(i, o) {
            var name = $(o).attr("value");
            if (!name) return;
            obj[name] = $(o).getFormData();
        });
        return obj;
    }, function(obj) {
        if (!obj) return;
        var id = $(this).attr("id");
        $($("#" + id + "-select").children("select")[0]).val(obj.defaultValue);
        change($("#" + id + "-select").children("select"));
        $(this).parent().children(".k-option-tabContent").children().each(function(i, o) {
            var name = $(o).attr("value");
            if (!name) return;
            $(o).setFormData(obj[name]);
        });
    });

    function change(o) {
        var value = $(o).val();
        var did = $(o).parent().attr("id");
        if (!did) {
            return;
        }
        var sid = did.substr(0, did.length - "-select".length);
        var tabContent = $("#" + sid).parent().children(".k-option-tabContent");
        if (tabContent.children().length === 0) {
            return;
        }
        tabContent.children().css("display", "none");
        var v = tabContent.children("[value=" + value);
        if (v) {
            tabContent.children("[value=" + value).css("display", "block");
        }
    }
});