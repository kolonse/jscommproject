var proxyData = null;
$(document).ready(function() {
    var NOTICE_STATUS = {
        "0": "<p style='color:red;'>待发送</p>",
        "1": "<p style='color:green;'>正发送</p>",
        "2": "<p style='color:gray;'>结束</p>",
        "3": "<p style='color:gray;'>关闭</p>"
    }

    function formatSecond(second) {
        var oneDay = 24 * 3600;
        var oneHour = 3600;
        var oneMin = 60;
        second = parseInt(second);
        var d = Math.floor(second / oneDay);
        var h = Math.floor((second % oneDay) / oneHour);
        var m = Math.floor((second % oneHour) / oneMin);
        var s = second % oneMin;
        if (second < oneMin) {
            return second + " s";
        } else if (second < oneHour) {
            return m + ":" + s + " min";
        } else if (second < oneDay) {
            return h + ":" + m + ":" + s + " h";
        } else {
            return d + " d";
        }
    }

    proxyData = $('#syclemessage-data').DataTable({
        scrollX: true,
        serverSide: true,
        autoWidth: true,
        deferRender: true,
        ordering: true,
        language: DataTableLanguage,
        dom: 'rtip',
        "order": [
            [0, "desc"]
        ],
        ajax: {
            url: '/getData/mysql/unTimeCycleMessage',
            type: 'POST',
            data: function(v) {
                v.attr = ["id", "startTime", "endTime", "who", "broadcastContent", "status"];
                v.where = {};
            }
        },
        "columns": [
            { "data": "id" },
            {
                "data": "startTime",
                render: function(data) {
                    var time = moment(data);
                    return time.isValid() ? time.format("YYYY-MM-DD HH:mm:ss") : "invalid time";
                }
            },
            {
                "data": "endTime",
                render: function(data) {
                    var time = moment(data);
                    return time.isValid() ? time.format("YYYY-MM-DD HH:mm:ss") : "invalid time";
                }
            },
            { "data": "who" },
            { "data": "broadcastContent" },
            {
                "data": "endTime",
                render: function(data, type, row, meta) {
                    var diff = moment(data).diff(moment(), "seconds");
                    if (diff <= 0) {
                        return "已结束";
                    }
                    return formatSecond(diff);
                }
            },
            { "data": "status" }
        ]
    });
    $('#syclemessage-data tbody').on('click', 'tr', function() {
        $(this).parent().children("tr").removeClass("selected");
        $(this).addClass('selected');
    });

    $('#syclemessage-data tbody').on('dblclick', 'tr', function() {
        $(this).parent().children("tr").removeClass("selected");
    });
});

function getSelectData() {
    return proxyData.row('.selected').data();
}