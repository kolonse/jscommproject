var datatable = null;
$(document).ready(function() {
    datatable = $('table').DataTable({
        scrollX: true,
        autoWidth: true,
        dom: 'rtip',
        serverSide: true,
        deferRender: true,
        ordering: true,
        language: DataTableLanguage,
        ajax: {
            url: '/getData/mysql/feedback',
            type: 'POST',
            data: function(v) {
                v.attr = ["id", "uid", "time", "content", "feedback", "version", "device", "flag"];
                v.where = {};
            }
        },
        "order": [
            [7, "asc"],
            [1, "desc"]
        ],
        "columns": [
            { "data": "id" },
            {
                "data": "time",
                render: function(data) {
                    return moment(data).format("YYYY-MM-DD HH:mm:ss");
                }
            },
            { "data": "uid" },
            {
                "data": "content",
                render: function(data) {
                    if (data.length <= 15) {
                        return data;
                    } else {

                        return new KString('<p data-toggle="tooltip" data-placement="bottom" title="${content}">${contentSub}...</p>')
                            .Set("contentSub", data.substr(0, 15))
                            .Set("content", data)
                            .Get();
                    }
                }
            },
            {
                "data": "feedback",
                render: function(data, obj, row) {
                    if (parseInt(row.flag) === 0) {
                        return '<input type="text" style="width:100%;height:100%;border:none;" maxlength="512" placeholder="点击回复..." id="feedback-' + row.id + '"></input>';
                    } else if (parseInt(row.flag) === 2) {
                        return '<input type="text" style="width:100%;height:100%;border:none;" maxlength="512" placeholder="点击回复..." id="feedback-' + row.id + '"></input>';
                    }
                    if (data.length <= 15) {
                        return data;
                    } else {
                        return new KString('<p data-toggle="tooltip" data-placement="bottom" title="${content}">${contentSub}...</p>')
                            .Set("contentSub", data.substr(0, 15))
                            .Set("content", data)
                            .Get();
                    }
                }
            },
            {
                "data": "version"
            },
            {
                "data": "device",
                render: function(data, obj, row) {
                    if (data.length <= 15) {
                        return data;
                    } else {
                        return new KString('<p data-toggle="tooltip" data-placement="bottom" title="${content}">${contentSub}...</p>')
                            .Set("contentSub", data.substr(0, 15))
                            .Set("content", data)
                            .Get();
                    }
                }
            },
            {
                "data": "flag",
                render: function(data, obj, row) {
                    if (parseInt(data) === 0) {
                        return '<button onclick="qbackinforesp(\'' + row.id + '\',' + row.uid + ')">回复</button>' + '<button onclick="qbackinfoignore(\'' + row.id + '\',' + row.uid + ')">忽略</button>';
                    }
                    if (parseInt(data) === 2) {
                        return '<button onclick="qbackinforesp(\'' + row.id + '\',' + row.uid + ')">回复</button>';
                    }
                    return "";
                }
            }
        ]
    });
});

function qbackinforesp(id, uid) {
    var feedback = $("#feedback-" + id).val();
    if (feedback.length === 0) {
        alert("回复内容不能为空");
        return;
    }
    $.post("/submitData/qbackinforesp", { id: id, uid: uid, feedback: feedback }, function(result, status, obj) {
        if (status === "success") {
            if (result.code !== 0) {
                fail(result.code, result.message);
                return;
            }
            datatable.ajax.reload();
            $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
        } else {
            fail(-1, "服务异常");
        }
    });
}

function qbackinfoignore(id, uid) {
    $.post("/submitData/qbackinfoignore", { id: id }, function(result, status, obj) {
        if (status === "success") {
            if (result.code !== 0) {
                fail(result.code, result.message);
                return;
            }
            datatable.ajax.reload();
            $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
        } else {
            fail(-1, "服务异常");
        }
    });
}