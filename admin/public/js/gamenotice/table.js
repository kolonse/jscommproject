var proxyData = null;
$(document).ready(function() {
    var NOTICE_STATUS = {
        "0": "<p style='color:red;'>待发送</p>",
        "1": "<p style='color:green;'>正发送</p>",
        "2": "<p style='color:gray;'>结束</p>",
        "3": "<p style='color:gray;'>关闭</p>"
    }
    proxyData = $('#notice-data').DataTable({
        scrollX: true,
        serverSide: true,
        autoWidth: true,
        dom: 'rtip',
        deferRender: true,
        ordering: true,
        language: DataTableLanguage,
        "order": [
            [0, "desc"]
        ],
        ajax: {
            url: '/getData/mysql/notice',
            type: 'POST',
            data: function(v) {
                v.attr = ["id", "beginDate", "endDate", "who", "noticeTitle", "noticeContent", "status"];
                v.where = {};
            }
        },
        "columns": [
            { "data": "id" },
            {
                "data": "beginDate",
                render: function(data) {
                    var time = moment(data);
                    return time.isValid() ? time.format("YYYY-MM-DD HH:mm:ss") : "invalid time";
                }
            },
            {
                "data": "endDate",
                render: function(data) {
                    var time = moment(data);
                    return time.isValid() ? time.format("YYYY-MM-DD HH:mm:ss") : "invalid time";
                }
            },
            { "data": "who" },
            { "data": "noticeTitle" },
            {
                "data": "noticeContent",
                render: function(data, obj, row) {
                    if (data.length <= 20) {
                        return data;
                    } else {

                        return new KString('<p data-toggle="tooltip" data-placement="bottom" title="${content}">${contentSub}...</p>')
                            .Set("contentSub", data.substr(0, 20))
                            .Set("content", data)
                            .Get();
                    }
                }
            },
            { "data": "status" }
        ]
    });
    $('#notice-data tbody').on('click', 'tr', function() {
        $(this).parent().children("tr").removeClass("selected");
        $(this).addClass('selected');
    });

    $('#notice-data tbody').on('dblclick', 'tr', function() {
        $(this).parent().children("tr").removeClass("selected");
    });
});

function getSelectData() {
    return proxyData.row('.selected').data();
}