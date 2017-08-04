var datatable = null;
$(document).ready(function() {
    datatable = $('table').DataTable({
        scrollX: true,
        autoWidth: true,
        serverSide: true,
        deferRender: true,
        ordering: true,
        dom: 'rtip',
        language: DataTableLanguage,
        ajax: {
            url: '/getData/mysql/warnlog',
            type: 'POST',
            data: function(v) {
                v.attr = ["id", "uid", "time", "type", "level", "value", "status"];
                v.where = {};
            }
        },
        "order": [
            [6, "asc"],
            [0, "desc"]
        ],
        "columns": [
            { "data": "id" },
            { "data": "uid" },
            { "data": "time" },
            { "data": "type" },
            { "data": "level" },
            { "data": "value" },
            {
                "data": "status",
                "orderable": true,
                render: function(data, obj, row) {
                    if (parseInt(data) === 0 && parseInt(row.level) === 2) {
                        return '需要解除';
                    } else if (parseInt(data) === 1 && parseInt(row.level) === 2) {
                        return '已经解除';
                    } else if (parseInt(data) === 2) {
                        return "已经忽略";
                    }
                    return '无需解除';
                }
            },
            {
                "data": "status",
                "orderable": false,
                render: function(data, obj, row) {
                    if (parseInt(data) === 0 && parseInt(row.level) === 2) {
                        return '<button onclick="deliquesce(' + row.id + ',' + row.uid + ',' + row.type + ')">解除</button>' + '<button onclick="ignoreWarning(' + row.id + ',' + row.uid + ',' + row.type + ')">忽略</button>';
                    } else if (parseInt(data) === 2 && parseInt(row.level) === 2) { // 如果是忽略的二级警报,也需要让用户能够进行解除
                        return '<button onclick="deliquesce(' + row.id + ',' + row.uid + ',' + row.type + ')">解除</button>';
                    } else if (parseInt(data) === 0 && parseInt(row.level) === 1) { // 如果是忽略的二级警报,也需要让用户能够进行解除
                        return '<button onclick="ignoreWarning(' + row.id + ',' + row.uid + ',' + row.type + ')">忽略</button>';
                    }
                    return "";
                }
            }
        ]
    });
});

function deliquesce(id, uid, type) {
    $.post("/submitData/unlockWarning", { id: id, uid: uid, type: type }, function(result, status, obj) {
        if (status === "success") {
            if (result.code !== 0) {
                fail(result.code, result.message);
                return;
            }
            datatable.ajax.reload();
        } else {
            fail(-1, "服务异常");
        }
    });
}

function ignoreWarning(id, uid, type) {
    $.post("/submitData/ignoreWarning", { id: id, uid: uid, type: type }, function(result, status, obj) {
        if (status === "success") {
            if (result.code !== 0) {
                fail(result.code, result.message);
                return;
            }
            datatable.ajax.reload();
        } else {
            fail(-1, "服务异常");
        }
    });
}