$(function() {
    $(".k-group").externForm("k-group", "-unknow-nothing-", function() {
        var obj = {};
        var name = $(this).attr("name");
        if (!name) return;
        var value = $(this).getFormData();
        obj[name] = value;
        return obj;
    }, function(obj) {
        if (!obj) return;
        var name = $(this).attr("name");
        if (!name) return;
        $(this).setFormData(obj[name]);
    });

});