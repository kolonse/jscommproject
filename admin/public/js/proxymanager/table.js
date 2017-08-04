var proxyData = null;
var tabFunc = {};
var tabList = {};
$(document).ready(function() {
    $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
        $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
    });

    proxyData = $('#proxy-data').DataTable({
        scrollX: true,
        serverSide: true,
        dom: 'rtip',
        autoWidth: true,
        deferRender: true,
        ordering: true,
        language: DataTableLanguage,
        ajax: {
            url: '/getData/mysql/proxy',
            type: 'POST',
            data: function(v) {
                v.attr = ["id", "username", "phone", "wxaccount", "unionmaxcount", "sharingrate", "status", "createdAt", "remark"];
                v.where = {};
            }
        },
        "columns": [
            { "data": "id" },
            { "data": "username" },
            { "data": "phone" },
            { "data": "wxaccount" },
            { "data": "unionmaxcount" },
            { "data": "sharingrate" },
            {
                "data": "status",
                render: function(data, type, row, meta) {
                    switch (parseInt(data)) {
                        case 0:
                            return "<p style='color:green;'>正常</p>";
                        case 1:
                            return "<p style='color:gray;'>冻结</p>";
                        case -1:
                            return "<p style='color:red;'>创建异常</p>";
                        default:
                            return data;
                    }
                    return parseInt(data) === 0 ? "<p style='color:green;'>正常</p>" : "<p style='color:red;'>冻结</p>";
                }
            },
            {
                "data": "createdAt",
                render: function(data) {
                    var time = moment(data);
                    return time.isValid() ? time.format("YYYY-MM-DD HH:mm:ss") : "invalid time";
                }
            },
            { "data": "remark" }
        ]
    });
    tabFunc = {
        proxydetail: function() {
            var obj = {
                clear: function() {
                    $("#proxydetail").setFormData({
                        playercount: 0,
                        totalcharge: 0,
                        totalused: 0,
                        unioncount: 0
                    });
                },
                draw: function(datas) {
                    $("#proxydetail").setFormData(datas);
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
        personalintests: function() {
            var myChart = echarts.init(document.getElementById('graphs-personalintests'));
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
                var obj = {};
                var isSmooth = true;
                var firstValue = datas[0].value;
                for (var i = 0; i < datas.length; i++) {
                    var date = moment(datas[i].key).format("YYYY-MM-DD");
                    if (obj[date] === undefined) {
                        obj[date] = 0;
                    }
                    obj[date] += datas[i].value;
                    if (datas[i].value !== firstValue) {
                        isSmooth = false;
                    }
                }
                for (var key in obj) {
                    labels.push(key);
                    values.push(obj[key]);
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
                "columns": [{
                        "data": "data.time",
                        render: function(data) {
                            var time = moment(data);
                            return time.isValid() ? time.format("YYYY-MM-DD HH:mm:ss") : "invalid time";
                        }
                    },
                    { "data": "data.ip" },
                    { "data": "data.addr" }
                ],
                "order": [
                    [0, "desc"]
                ]
            });
            dataTabel.draw = function(datas) {
                dataTabel.rows.add(datas).draw();
            };
            return dataTabel;
        }
    };
    $('#proxy-data tbody').on('click', 'tr', function() {
        $(this).parent().children("tr").removeClass("selected");
        $(this).addClass('selected');
    });

    $('#proxy-data tbody').on('dblclick', 'tr', function() {
        $(this).parent().children("tr").removeClass("selected");
    }); 

    $('#proxy-data tbody').on('click', 'tr', function() {
        loadData(curActiveId);
    });

    tabToggle("proxydetail");
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