var proxyData = null;
var tabFunc = {};
var tabList = {};
var width = 1318;
$(document).ready(function() {
    $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
        $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
    });

    proxyData = $('#player-data').DataTable({
        scrollX: true,
        dom: 'rtip',
        serverSide: true,
        autoWidth: true,
        deferRender: true,
        ordering: true,
        language: DataTableLanguage,
        ajax: {
            url: '/getData/mysql/roles',
            type: 'POST',
            data: function(v) {
                v.attr = ["uid", "name", "room_card", "gold", "total_charge", "vip_level", "leader", "unionId", "sys_flags", "create_time", "last_login"];
                v.where = [];
                var filter = $("#player-filter").getFormData();
                var uid = parseInt(filter.uid);
                if (!isNaN(uid)) {
                    v.where.push("uid like '" + uid + "%'");
                }
            }
        },
        "columns": [
            { "data": "uid" },
            { "data": "name" },
            { "data": "room_card" },
            { "data": "gold" },
            { "data": "total_charge" },
            { "data": "vip_level" },
            { "data": "leader" },
            { "data": "unionId" },
            {
                "data": "sys_flags",
                render: function(data, type, row, meta) {
                    return parseInt(data) === 0 ? "<p style='color:green;'>正常</p>" : "<p style='color:red;'>冻结</p>";
                }
            },
            {
                "data": "create_time",
                render: function(data) {
                    var time = moment(data);
                    return time && time.isValid() ? time.format("YYYY-MM-DD HH:mm:ss") : "";
                }
            },
            {
                "data": "last_login",
                render: function(data) {
                    var time = moment(data);
                    return time && time.isValid() ? time.format("YYYY-MM-DD HH:mm:ss") : "";
                }
            }
        ]
    });
    tabFunc = {
        chargerecord: function() {
            var dataTabel = $('#table-chargerecord').DataTable({
                scrollX: true,
                dom: 'rtip',
                serverSide: false,
                autoWidth: false,
                deferRender: true,
                ordering: false,
                language: DataTableLanguage,
                "columns": [{
                        "data": "data.time_start",
                        render: function(data) {
                            return data.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1-$2-$3 $4:$5:$6");
                        }
                    },
                    { "data": "data.trade_type" },
                    { "data": "data.shopid" },
                    { "data": "data.price" },
                    { "data": "data.count" },
                    { "data": "data.leave_card" },
                    { "data": "data.vip_level" }
                ]
            });
            dataTabel.getSelectData = function() {
                return this.row('.selected').data();
            };
            return dataTabel;
        },
        giverecord: function() {
            var dataTabel = $('#table-giverecord').DataTable({
                scrollX: true,
                dom: 'rtip',
                serverSide: false,
                autoWidth: false,
                deferRender: true,
                ordering: false,
                language: DataTableLanguage,
                "columns": [{
                        "data": "data.time",
                        render: function(data) {
                            var time = moment(data);
                            return time.isValid() ? time.format("YYYY-MM-DD HH:mm:ss") : "invalid time";
                        }
                    },
                    { "data": "data.rname" },
                    { "data": "data.ruid" },
                    { "data": "data.count" }
                ]
            });
            dataTabel.getSelectData = function() {
                return this.row('.selected').data();
            };
            return dataTabel;
        },
        receiverecord: function() {
            var dataTabel = $('#table-receiverecord').DataTable({
                scrollX: true,
                dom: 'rtip',
                serverSide: false,
                autoWidth: false,
                deferRender: true,
                ordering: false,
                language: DataTableLanguage,
                "columns": [{
                        "data": "data.time",
                        render: function(data) {
                            var time = moment(data);
                            return time.isValid() ? time.format("YYYY-MM-DD HH:mm:ss") : "invalid time";
                        }
                    },
                    { "data": "data.sname" },
                    { "data": "data.suid" },
                    { "data": "data.count" }
                ]
            });
            dataTabel.getSelectData = function() {
                return this.row('.selected').data();
            };
            return dataTabel;
        },
        reducerecord: function() {
            var dataTabel = $('#table-reducerecord').DataTable({
                scrollX: true,
                dom: 'rtip',
                serverSide: false,
                autoWidth: false,
                deferRender: true,
                ordering: false,
                language: DataTableLanguage,
                "columns": [{
                        "data": "data.time",
                        render: function(data) {
                            var time = moment(data);
                            return time.isValid() ? time.format("YYYY-MM-DD HH:mm:ss") : "invalid time";
                        }
                    },
                    { "data": "data.count" },
                    { "data": "data.remark" }
                ]
            });
            dataTabel.getSelectData = function() {
                return this.row('.selected').data();
            };
            return dataTabel;
        },
        historyrecord: function() {
            var dataTabel = $('#table-historyrecord').DataTable({
                scrollX: true,
                dom: 'rtip',
                serverSide: false,
                autoWidth: false,
                deferRender: true,
                ordering: false,
                language: DataTableLanguage,
                "columns": [
                    { "data": "data.roomid" },
                    { "data": "data.bulletvalue" },
                    { "data": "data.bulletcount" },
                    { "data": "data.playercount" },
                    { "data": "data.roundcount" },
                    {
                        "data": "data.start",
                        render: function(data) {
                            var time = moment(data);
                            return time.isValid() ? time.format("YYYY-MM-DD HH:mm:ss") : "invalid time";
                        }
                    },
                    {
                        "data": "data.end",
                        render: function(data) {
                            var time = moment(data);
                            return time.isValid() ? time.format("YYYY-MM-DD HH:mm:ss") : "invalid time";
                        }
                    },
                    { "data": "data.host" },
                    {
                        "data": "data.gameinfo",
                        // width: "200px"
                    }
                ]
            });
            dataTabel.getSelectData = function() {
                return this.row('.selected').data();
            };
            return dataTabel;
        }
    };
    $('tbody').on('click', 'tr', function() {
        $(this).parent().children("tr").removeClass("selected");
        $(this).addClass('selected');
    });

    $('tbody').on('dblclick', 'tr', function() {
        $(this).parent().children("tr").removeClass("selected");
    }); 
    $('#player-data tbody').on('click', 'tr', function() {
        loadData(curActiveId);
    });


    // $("#giverecord").css("display", "block");
    // $("#receiverecord").css("display", "block");
    // $("#reducerecord").css("display", "block");
    // $("#historyrecord").css("display", "block");
    tabToggle("chargerecord");
    // tabToggle("giverecord");
    // tabToggle("receiverecord");
    // tabToggle("reducerecord");
    // tabToggle("historyrecord");
    // $("#giverecord").css("display", "");
    // $("#receiverecord").css("display", "");
    // $("#reducerecord").css("display", "");
    // $("#historyrecord").css("display", "");
});
var curActiveId = "";

function tabToggle(id) {
    curActiveId = id;
    loadData(id);
    if (tabList[id]) {
        return;
    }
    tabList[id] = tabFunc[id]();
}

function getSelectData() {
    return proxyData.row('.selected').data();
}