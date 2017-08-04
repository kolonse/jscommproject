var RECORD_MAX_COUNT = 20;
var proxyData = null;
var tabFunc = {};
var tabList = {};
$(document).ready(function() {
    proxyData = $('#table-loginrecord').DataTable({
        scrollX: true,
        dom: 'rtip',
        serverSide: false,
        autoWidth: true,
        deferRender: true,
        ordering: false,
        language: DataTableLanguage,
        "columns": [
            { "data": "data.ip", width: "100px" },
            { "data": "data.addr", width: "150px" },
            {
                "data": "data.time",
                width: "200px",
                render: function(data) {
                    var time = moment(data);
                    return time.isValid() ? time.format("YYYY-MM-DD HH:mm:ss") : "invalid time";
                }
            }
        ]
    });
    $('tbody').on('click', 'tr', function() {
        $(this).parent().children("tr").removeClass("selected");
        $(this).addClass('selected');
    });

    $('tbody').on('dblclick', 'tr', function() {
        $(this).parent().children("tr").removeClass("selected");
    }); 

    function loadData() {
        var admin = window.sessionStorage.getItem("admin");
        var param = {
            cond: JSON.stringify({
                event: "loginrecord",
                method: "find", //调用 count  方法 统计出数据记录数
                arg: [{
                    "data.admin": admin,
                    "data.type": "admin"
                }, {
                    "data.ip": 1,
                    "data.addr": 1,
                    "data.time": 1,
                    "_id": 0
                }],
                nextMethods: [{
                        method: "sort",
                        arg: [
                            { "data.time": -1 }
                        ]
                    },
                    {
                        method: "skip",
                        arg: [0]
                    },
                    {
                        method: "limit",
                        arg: [RECORD_MAX_COUNT]
                    },
                    {
                        method: "lean"
                    }
                ]
            })
        };
        $.post("/submitData/getMgoRecord", param, function(result, status, obj) {
            if (status === "success") {
                if (result.code !== 0) {
                    fail(result.code, result.message);
                    return;
                }
                success(result.data);
            } else {
                fail(-1, "服务异常");
            }
        });

        function success(datas) {
            proxyData.clear();
            proxyData.rows.add(datas).draw();
        }
    }
    loadData();
});

function getSelectData() {
    return proxyData.row('.selected').data();
}