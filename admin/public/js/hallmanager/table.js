var proxyData = null;
var roominfofight = null;
var roominfopublic = null;
var roominfoclassics = null;
var roominfoindiana = null;
var RoomRole = {
    0: "竞技场",
    1: "金币-公众", // 公众场
    2: "金币-私人-经典", // 经典
    3: "金币-私人-夺宝"
};
var RoomState = {
    "-1": "未开始",
    0: "准备",
    1: "出鱼",
    2: "停止射击",
    3: "清场",
    4: "鱼阵",
    5: "结算"
};
var pageLanguage = DataTableLanguage;
pageLanguage.paginate = {
    "first": "第一组服务器",
    "last": "最后一组服务器",
    "next": "查看下一个服务器",
    "previous": "服务器编号列表:"
};
$(document).ready(function() {
    proxyData = $('#room-data').DataTable({
        scrollX: false, ////// -----------------   这个如果有属性 可能会影响表数据不对齐
        serverSide: true,
        autoWidth: true,
        dom: 'rt<"left" p>',
        deferRender: true,
        ordering: true,
        language: pageLanguage,
        "order": [
            [0, "desc"]
        ],
        pageLength: 1,
        ajax: {
            url: '/getData/roominfo',
            type: 'POST',
            data: function(v) {}
        },
        "columns": [
            { "data": "uid" },
            {
                "data": "rule",
                render: function(data) {
                    if (RoomRole[data]) {
                        return RoomRole[data];
                    }
                    return data;
                }
            },
            {
                "data": "roominfo",
                render: function(data, _, row) {
                    if (row.rule === 2 || row.rule === 3) {
                        var t = row.deadLine;
                        return "剩余时长:" + Math.floor(t / 60000) + ":" + Math.floor((t % 60000) / 1000);
                    }
                    if (row.rule === 0) {
                        var info = {
                            roundCount: row.roundCount, // 局数
                            seatCount: row.seatCount, // 几人
                            bulletValue: row.bulletValue, //炮值
                            bulletCount: row.bulletCount, //子弹数
                        };
                        return info.roundCount + "局/" + info.seatCount + "人/" + info.bulletValue + "倍炮/" + info.bulletCount + "子弹";
                    }
                    return "/";
                }
            },
            {
                "data": "seats",
                render: function(data, _, row) {
                    var count = 0;
                    for (var i = 0; i < data.length; i++) {
                        if (data[i] !== -1) {
                            count = count + 1;
                        }
                    }
                    return count;
                }
            },
            {
                "data": "state",
                render: function(data, _, row) {
                    if (RoomState[data]) {
                        return RoomState[data];
                    }
                    return data;
                }
            },
            {
                "data": "uid",
                render: function(data, obj, row) {
                    var str = JSON.stringify(row);
                    str = str.replace(/"/g, '\\"');
                    return '<button type="button" class="btn btn-default" onclick=\'displayroominfo("' + str + '")\'>查看详情</button>';
                }
            }
        ]
    });
    $('#room-data tbody').on('click', 'tr', function() {
        $(this).parent().children("tr").removeClass("selected");
        $(this).addClass('selected');
    });

    $('#room-data tbody').on('dblclick', 'tr', function() {
        $(this).parent().children("tr").removeClass("selected");
    });

    roominfofight = $('#roominfofight-data').DataTable({
        scrollX: true,
        autoWidth: true,
        dom: '',
        deferRender: true,
        ordering: false,
        language: DataTableLanguage,
        "order": [
            [0, "desc"]
        ],
        // pageLength: 1,
        "columns": [
            { "data": "uid" },
            { "data": "p1" },
            { "data": "p2" },
            { "data": "p3" },
            { "data": "p4" },
            { "data": "total" }
        ]
    });
    $("#roominfofight-data_wrapper div.dataTables_scrollHeadInner").width($("#roominfofight-data_wrapper div.dataTables_scrollHead").width() - 10);
    $("#roominfofight-data_wrapper table").width($("#roominfofight-data_wrapper div.dataTables_scrollHead").width() - 10);
    // $("#roominfofight").modal('hide');


    roominfopublic = $('#roominfopublic-data').DataTable({
        scrollX: true,
        // serverSide: true,
        autoWidth: true,
        dom: '',
        deferRender: true,
        ordering: false,
        language: DataTableLanguage,
        // pageLength: 1,
        "columns": [
            { "data": "uid" },
            { "data": "gold" },
            { "data": "card" },
            { "data": "tp" },
            { "data": "tg" }
        ]
    });
    $("#roominfopublic-data_wrapper div.dataTables_scrollHeadInner").width($("#roominfopublic-data_wrapper div.dataTables_scrollHead").width() - 10);
    $("#roominfopublic-data_wrapper table").width($("#roominfopublic-data_wrapper div.dataTables_scrollHead").width() - 10);
    // $("#roominfopublic").modal('hide');

    roominfoclassics = $('#roominfoclassics-data').DataTable({
        scrollX: true,
        // serverSide: true,
        autoWidth: true,
        dom: '',
        deferRender: true,
        ordering: false,
        language: DataTableLanguage,
        // pageLength: 1,
        "columns": [
            { "data": "uid" },
            { "data": "gold" },
            { "data": "card" },
            { "data": "tp" },
            { "data": "tg" }
        ]
    });
    $("#roominfoclassics-data_wrapper div.dataTables_scrollHeadInner").width($("#roominfoclassics-data_wrapper div.dataTables_scrollHead").width() - 10);
    $("#roominfoclassics-data_wrapper table").width($("#roominfoclassics-data_wrapper div.dataTables_scrollHead").width() - 10);
    // $("#roominfoclassics").modal('hide');

    roominfoindiana = $('#roominfoindiana-data').DataTable({
        scrollX: true,
        // serverSide: true,
        autoWidth: true,
        dom: '',
        deferRender: true,
        ordering: false,
        language: DataTableLanguage,
        // pageLength: 1,
        "columns": [
            { "data": "uid" },
            { "data": "gold" },
            { "data": "card" },
            { "data": "status" }
        ]
    });
    $("#roominfoindiana-data_wrapper div.dataTables_scrollHeadInner").width($("#roominfoindiana-data_wrapper div.dataTables_scrollHead").width() - 10);
    $("#roominfoindiana-data_wrapper table").width($("#roominfoindiana-data_wrapper div.dataTables_scrollHead").width() - 10);
    // $("#roominfoindiana").modal('hide');
});
// $("#roominfofight").modal('show');
// $("#roominfopublic").modal('show');
// $("#roominfoclassics").modal('show');
// $("#roominfoindiana").modal('show');

function getSelectData() {
    return proxyData.row('.selected').data();
}

function displayroominfo(str) {
    var obj = JSON.parse(str);
    switch (parseInt(obj.rule)) {
        case 0:
            return displayfight(obj);
        case 1:
            return displaypublic(obj);
        case 2:
            return displayclassics(obj);
        case 3:
            return displayindiana(obj);
    }
}

function displayfight(obj) {
    $("#roominfofight").modal('show');
    roominfofight.clear();
    $("#roominfofight #uid").text(obj.uid);
    $("#roominfofight #rule").text("" + (function(data) {
        if (RoomRole[data]) {
            return RoomRole[data];
        }
        return data;
    })(obj.rule));
    $("#roominfofight #roominfofightPanel").text("" + (function(row) {
        return row.roundCount + "局/" + row.seatCount + "人/" + row.bulletValue + "倍炮/" + row.bulletCount + "子弹";
    })(obj));
    $.post("/submitData/getRoomDetailInfo", { uid: obj.uid }, function(result, status) {
        if (status === "success") {
            if (result.code !== 0) {
                fail(result.code, result.message);
                return;
            }
            var datas = [];
            for (var i = 0; i < result.data.length; i++) {
                if (!result.data[i]) {
                    continue;
                }
                datas.push({
                    uid: result.data[i][0] + "(" + result.data[i][1] + ")",
                    p1: result.data[i].length >= 3 ? result.data[i][2] : "",
                    p2: result.data[i].length >= 4 ? result.data[i][3] : "",
                    p3: result.data[i].length >= 5 ? result.data[i][4] : "",
                    p4: result.data[i].length >= 6 ? result.data[i][5] : "",
                    total: result.data[i].length >= 7 ? result.data[i][6] : ""
                });
            }
            roominfofight.rows.add(datas).draw();
        } else {
            fail(-1, "服务异常");
        }
    });
}

function displaypublic(obj) {
    $("#roominfopublic").modal('show');
    roominfopublic.clear();
    $("#roominfopublic #uid").text(obj.uid);
    $("#roominfopublic #rule").text("" + (function(data) {
        if (RoomRole[data]) {
            return RoomRole[data];
        }
        return data;
    })(obj.rule));
    $.post("/submitData/getRoomDetailInfo", { uid: obj.uid }, function(result, status) {
        if (status === "success") {
            if (result.code !== 0) {
                fail(result.code, result.message);
                return;
            }
            var datas = [];
            for (var i = 0; i < result.data.length; i++) {
                if (!result.data[i]) {
                    continue;
                }
                datas.push({
                    uid: result.data[i][0] + "(" + result.data[i][1] + ")",
                    gold: result.data[i][2],
                    card: result.data[i][3],
                    tp: result.data[i][4],
                    tg: result.data[i][5]
                });
            }
            roominfopublic.rows.add(datas).draw();
        } else {
            fail(-1, "服务异常");
        }
    });
}

function displayclassics(obj) {
    $("#roominfoclassics").modal('show');
    roominfoclassics.clear();
    $("#roominfoclassics #uid").text(obj.uid);
    $("#roominfoclassics #rule").text("" + (function(data) {
        if (RoomRole[data]) {
            return RoomRole[data];
        }
        return data;
    })(obj.rule));
    $("#roominfoclassics #hostid").text(obj.owner);
    $.post("/submitData/getRoomDetailInfo", { uid: obj.uid }, function(result, status) {
        if (status === "success") {
            if (result.code !== 0) {
                fail(result.code, result.message);
                return;
            }
            var datas = [];
            for (var i = 0; i < result.data.length; i++) {
                if (!result.data[i]) {
                    continue;
                }
                datas.push({
                    uid: result.data[i][0] + "(" + result.data[i][1] + ")",
                    gold: result.data[i][2],
                    card: result.data[i][3],
                    tp: result.data[i][4],
                    tg: result.data[i][5]
                });
            }
            roominfoclassics.rows.add(datas).draw();
        } else {
            fail(-1, "服务异常");
        }
    });
}

function displayindiana(obj) {
    $("#roominfoindiana").modal('show');
    roominfoindiana.clear();
    $("#roominfoindiana #uid").text(obj.uid);
    $("#roominfoindiana #rule").text("" + (function(data) {
        if (RoomRole[data]) {
            return RoomRole[data];
        }
        return data;
    })(obj.rule));
    $("#roominfoindiana #hostid").text(obj.owner);
    $.post("/submitData/getRoomDetailInfo", { uid: obj.uid }, function(result, status) {
        if (status === "success") {
            if (result.code !== 0) {
                fail(result.code, result.message);
                return;
            }
            var datas = [];
            for (var i = 0; i < result.data.length; i++) {
                if (!result.data[i]) {
                    continue;
                }
                datas.push({
                    uid: result.data[i][0] + "(" + result.data[i][1] + ")",
                    gold: result.data[i][2],
                    card: result.data[i][3],
                    status: result.data[i][4]
                });
            }
            roominfoindiana.rows.add(datas).draw();
        } else {
            fail(-1, "服务异常");
        }
    });
}