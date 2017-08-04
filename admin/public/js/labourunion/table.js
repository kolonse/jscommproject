var proxyData = null;
var tabFunc = {};
var tabList = {};
var width = 1318;
$(document).ready(function() {
    // <th>工会ID</th>
    // <th>工会名称</th>
    // <th>玩家总数</th>
    // <th>总充值</th>
    // <th>总消耗</th>
    // <th>所属代理</th>
    // <th>会长游戏ID</th>
    // <th>副会长数量</th>
    // <th>创建时间</th>
    $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
        $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
    });
    proxyData = $('#labour-data').DataTable({
        scrollX: true,
        serverSide: true,
        autoWidth: true,
        dom: 'rtip',
        deferRender: false,
        ordering: false,
        language: DataTableLanguage,
        "order": [
            [0, "desc"]
        ],
        ajax: {
            url: '/getData/mysql/union',
            type: 'POST',
            data: function(v) {
                v.attr = ["id", "name", "proxyId", "createdAt"];
                v.where = {};
            }
        },
        "columns": [
            { "data": "id" },
            { "data": "name" },
            { "data": "proxyId" },
            {
                "data": "createdAt",
                render: function(data) {
                    var time = moment(data);
                    return time.isValid() ? time.format("YYYY-MM-DD HH:mm:ss") : "invalid time";
                }
            }
        ]
    });

    tabFunc = {
        uniondetail: function() {
            var obj = {
                clear: function() {
                    $("#uniondetail").setFormData({
                        playercount: 0,
                        totalcharge: 0,
                        totalused: 0,
                        unionerGameId: "",
                        viceunionercount: 0
                    });
                },
                draw: function(datas) {
                    $("#uniondetail").setFormData(datas);
                }
            };
            return obj;
        },
        cardcost: function() {
            var myChart = echarts.init(document.getElementById('graphs-cardcost'));
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
        cardcharge: function() {
            var myChart = echarts.init(document.getElementById('graphs-cardcharge'));
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
        newplayer: function() {
            var myChart = echarts.init(document.getElementById('graphs-newplayer'));
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
        activeplayer: function() {
            var myChart = echarts.init(document.getElementById('graphs-activeplayer'));
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
        unionerlist: function() {
            var dataTabel = $('#table-unionerlist').DataTable({
                scrollX: true,
                dom: 'rtip',
                serverSide: false,
                autoWidth: false,
                deferRender: true,
                ordering: true,
                language: DataTableLanguage,
                "order": [
                    [0, "desc"]
                ],
                "columns": [
                    { "data": "id" },
                    { "data": "playerGameId" },
                    { "data": "sharingrate" },
                    {
                        "data": "createdAt",
                        render: function(data) {
                            var time = moment(data);
                            return time && time.isValid() ? time.format("YYYY-MM-DD HH:mm:ss") : "invalid time";
                        }
                    }
                ]
            });
            dataTabel.getSelectData = function() {
                return this.row('.selected').data();
            };
            dataTabel.draw = function(datas) {
                dataTabel.rows.add(datas).draw();
            };
            return dataTabel;
        }
    };
    $('#labour-data tbody').on('click', 'tr', function() {
        $(this).parent().children("tr").removeClass("selected");
        $(this).addClass('selected');
    });

    $('#labour-data tbody').on('dblclick', 'tr', function() {
        $(this).parent().children("tr").removeClass("selected");
    }); 

    $('#labour-data tbody').on('click', 'tr', function() {
        loadData(curActiveId);
    });

    tabToggle("uniondetail");
});

var curActiveId = "";

function tabToggle(id) {
    console.log(id);
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