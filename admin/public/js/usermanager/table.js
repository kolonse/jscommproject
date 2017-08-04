var proxyData = null;
var tabFunc = {};
var tabList = {};
$(document).ready(function() {
    proxyData = $('#player-data').DataTable({
        scrollX: true,
        dom: 'rtip',
        serverSide: true,
        autoWidth: true,
        deferRender: true,
        ordering: true,
        language: DataTableLanguage,
        ajax: {
            url: '/getData/adminusers',
            type: 'POST'
        },
        "columns": [
            { "data": "id" },
            { "data": "username" },
            {
                "data": "power",
                render: function(data, type, row, meta) {
                    switch (parseInt(data)) {
                        case 0:
                            return "超级管理员";
                        case 1:
                            return "一级管理员";
                        case 2:
                            return "二级管理员";
                        case 3:
                            return "三级管理员";
                    }
                }
            },
            { "data": "boss" },
            {
                "data": "createdAt",
                render: function(data, type, row, meta) {
                    var time = moment(data);
                    if (time.isValid()) {
                        return time.format("YYYY-MM-DD HH:mm:ss");
                    }
                    return data;
                }
            },
            {
                "data": "status",
                render: function(data, type, row, meta) {
                    switch (parseInt(data)) {
                        case 0:
                            return "正常";
                        case 1:
                            return "冻结";
                    }
                }
            },
            { "data": "remark" }
        ]
    });
    $('tbody').on('click', 'tr', function() {
        $(this).parent().children("tr").removeClass("selected");
        $(this).addClass('selected');
    });

    $('tbody').on('dblclick', 'tr', function() {
        $(this).parent().children("tr").removeClass("selected");
    }); 
    $("[name='power']>label").removeClass("col-sm-2");
    $("[name='power']>div").removeClass("col-sm-8");

    $("#auth .checkbox").each(function(i, o) {
        o = $(o);
        if (/first|second|third/.test(o.next().attr("class"))) {
            o.addClass("auth-inline");
            o.next().addClass("auth-inline");
        }
    });

    $("#auth .checkbox>input[type=checkbox]").on('click', function(e) {
        if (!$(e.currentTarget)[0].checked) {
            var cs = $(e.currentTarget).parent().next().attr("class");
            if (/first|second|third/.test(cs)) {
                $(e.currentTarget).parent().next().find("input[type=checkbox]").each(function(i, o) {
                    o.checked = false;
                });
            }
        } else {
            var cls = $(e.currentTarget).parent().parent().attr("class");
            if (/second/.test(cls)) {
                $(e.currentTarget).parent().parent().prev().find("input[type=checkbox]")[0].checked = true;
                $(e.currentTarget).parent().parent().parent().prev().find("input[type=checkbox]")[0].checked = true;
            } else if (/first/.test(cls)) {
                $(e.currentTarget).parent().parent().prev().find("input[type=checkbox]")[0].checked = true;
            }
        }
    });
    $.fn.readAuthResult = function() {
        var obj = {};
        $(this).children("div.checkbox").each(function(i, o) {
            var name = $(o).children("input[type=checkbox]")[0].name;
            var v = $(o).children("input[type=checkbox]")[0].checked;
            obj[name] = { value: v, child: {} };
            var cls = $(o).next().attr("class");
            if (/first|second|third/.test(cls)) {
                obj[name].child = $(o).next().readAuthResult();
            }
        });
        return obj;
    };

    $.fn.writeAuthResult = function(obj) {
        if (!obj || Object.keys(obj).length === 0) {
            return;
        }
        $(this).children("div.checkbox").each(function(i, o) {
            var name = $(o).children("input[type=checkbox]")[0].name;
            $(o).children("input[type=checkbox]")[0].checked = obj[name].value;
            var cls = $(o).next().attr("class");
            if (/first|second|third/.test(cls)) {
                $(o).next().writeAuthResult(obj[name].child);
            }
        });
    };

    $(".auth").externForm("modal-body auth", "-unknow-nothing-", function() {
        return $(this).readAuthResult();
    }, function(obj) {
        var powersv = obj.powersv;
        var parse = null;
        parse = function(data, o) {
            for (var k in data) {
                if (data[k].value === false) {
                    $($(o).find("input[name=" + k + "]").parent()).addClass("disable");
                    var cls = $(o).find("input[name=" + k + "]").parent().next().attr("class");
                    if (/first|second|third/.test(cls)) {
                        $(o).find("input[name=" + k + "]").parent().next().addClass("disable");
                    }
                    continue;
                }

                $($(o).find("input[name=" + k + "]").parent()).removeClass("disable");
                $(o).find("input[name=" + k + "]")[0].checked = true;
                if (data[k].child && Object.keys(data[k].child) !== 0) {
                    $(o).find("input[name=" + k + "]").parent().next().removeClass("disable");
                    parse(data[k].child, $(o).find("input[name=" + k + "]").parent().next());
                }
            }
        };
        parse(powersv, $(".auth"));
        var powerdiy = obj.powerdiy;
        try {
            powerdiy = JSON.parse(powerdiy);
        } catch (e) {
            powerdiy = null;
        }
        var init = null;
        init = function(data, o) {
            for (var k in data) {
                if (data[k].value === true) {
                    $(o).find("input[name=" + k + "]")[0].checked = true;
                } else {
                    $(o).find("input[name=" + k + "]")[0].checked = false;
                }
                if (data[k].child && Object.keys(data[k].child) !== 0) {
                    init(data[k].child, $(o).find("input[name=" + k + "]").parent().next());
                }
            }
        };
        init(powerdiy, $(".auth"));
    });
});

function getSelectData() {
    return proxyData.row('.selected').data();
}