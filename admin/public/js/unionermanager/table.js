var proxyData = null;
var tabFunc = {};
var tabList = {};
$(document).ready(function() {
    $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
        $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
    });
    proxyData = $('#unioner-data').DataTable({
        scrollX: true,
        serverSide: true,
        autoWidth: true,
        deferRender: true,
        ordering: false,
        dom: 'rtip',
        language: DataTableLanguage,
        ajax: {
            url: '/getData/mysql/unioner',
            type: 'POST',
            data: function(v) {
                v.attr = ["id", "playerGameId", "username", "type", "proxyId", "unionId", "sharingrate", "createdAt", "remark"];
                v.where = {};
            }
        },
        "columns": [
            { "data": "id" },
            { "data": "playerGameId" },
            { "data": "id" },
            {
                "data": "type",
                render: function(data, type, row, meta) {
                    return parseInt(data) === 0 ? "<p style='color:green;'>会长</p>" : "<p style='color:gray;'>副会长</p>";
                }
            },
            { "data": "proxyId" },
            { "data": "unionId" },
            { "data": "sharingrate" },
            {
                "data": "createdAt",
                render: function(data) {
                    var time = moment(data);
                    return time && time.isValid() ? time.format("YYYY-MM-DD HH:mm:ss") : "invalid time";
                }
            },
            { "data": "remark" }
        ]
    });
    $('#unioner-data tbody').on('click', 'tr', function() {
        $(this).parent().children("tr").removeClass("selected");
        $(this).addClass('selected');
    });

    $('#unioner-data tbody').on('dblclick', 'tr', function() {
        $(this).parent().children("tr").removeClass("selected");
    }); 

    $('#unioner-data tbody').on('click', 'tr', function() {
        loadData(curActiveId);
    });
    tabFunc = {
        income: function() {
            var myChart = echarts.init(document.getElementById('graphs-income'));
            var option = {
                tooltip: {},
                xAxis: {
                    data: []
                },
                yAxis: {},
                series: [{
                    type: 'line',
                    data: []
                }]
            };
            myChart.clear = function() {
                myChart.setOption(option);
            };
            myChart.draw = function(datas) {
                if (datas.length === 0) {
                    return;
                }
                var labels = [];
                var values = [];
                var isSmooth = true;
                var firstValue = datas[0].value;
                for (var i = 0; i < datas.length; i++) {
                    labels.push(moment(datas[i].key).format("YYYY-MM-DD"));
                    values.push(datas[i].value);
                    if (datas[i].value !== firstValue) {
                        isSmooth = false;
                    }
                }
                if (isSmooth) {
                    labels.push("未来");
                    values.push(firstValue * 2);
                    labels.unshift("过去");
                    values.unshift(0);
                }
                myChart.setOption({
                    tooltip: {},
                    xAxis: [{
                        type: 'category',
                        boundaryGap: false,
                        data: labels
                    }],
                    yAxis: [{
                        type: 'value'
                    }],
                    series: [{
                        type: 'line',
                        areaStyle: { normal: {} },
                        label: {
                            normal: {
                                show: true,
                                position: 'top'
                            }
                        },
                        data: values
                    }]
                });
            };
            return myChart;
        },
        loginiprecord: function() {
            var dataTabel = $('#table-loginiprecord').DataTable({
                scrollX: true,
                dom: 'rtip',
                serverSide: false,
                autoWidth: false,
                deferRender: true,
                ordering: true,
                language: DataTableLanguage,
                "columns": [
                    { "data": "data.time" },
                    { "data": "data.ip" },
                    { "data": "data.addr" }
                ],
                "order": [
                    [0, "desc"]
                ]
            });
            // dataTabel.clear = function() {
            //     dataTabel.clear();
            // };
            dataTabel.draw = function(datas) {
                dataTabel.rows.add(datas).draw();
            };
            return dataTabel;
        }
    };
    tabToggle("income");
});
var curActiveId = "";

function getSelectData() {
    return proxyData.row('.selected').data();
}

function tabToggle(id) {
    curActiveId = id;
    loadData(id);
    if (tabList[id]) {
        return;
    }
    tabList[id] = tabFunc[id]();
}