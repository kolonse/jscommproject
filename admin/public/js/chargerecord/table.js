var proxyData = null;
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
    $("#datetime-chargerecord").setFormData({
        from: moment().subtract(1, "d").format("YYYY-MM-DDTHH:mm:ss"),
        to: moment().format("YYYY-MM-DDTHH:mm:ss")
    });
    proxyData = $('#table-chargerecord').DataTable({
        scrollX: true,
        serverSide: true,
        dom: 'rtip',
        autoWidth: true,
        deferRender: false,
        ordering: true,
        language: DataTableLanguage,
        order: [
            [0, "desc"]
        ],
        ajax: {
            url: '/getData/mysql/pay',
            type: 'POST',
            data: function(v) {
                var cond = $("#query-cond").getFormData();
                v.where = {
                    "$and": [
                        { "time_start": { "$gte": moment(cond.from).format("YYYYMMDDHHmmss") } },
                        { "time_start": { "$lte": moment(cond.to).format("YYYYMMDDHHmmss") } }
                    ]
                };
                var status = parseInt(cond.chargestatus.defaultValue);
                if (!isNaN(status) && status !== -1) {
                    v.where.status = status;
                }

                var shopid = parseInt(cond.shopinfo.defaultValue);
                if (!isNaN(shopid) && shopid !== -1) {
                    v.where.shopid = shopid;
                }
                v.attr = ["id", "time_start", "time_end", "uid", "shopid", "price", "status", "trade_type", "err_code_des"];
            }
        },
        "columns": [
            { "data": "id" },
            {
                "data": "time_start",
                render: function(data) {
                    return data.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1-$2-$3 $4:$5:$6");
                }
            },
            {
                "data": "time_end",
                render: function(data) {
                    if (data) {
                        return data.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1-$2-$3 $4:$5:$6");
                    }
                    return "";
                }
            },
            { "data": "uid" },
            { "data": "shopid" },
            {
                "data": "shopid",
                orderable: false,
                render: function(data) {
                    if (!config || !config.shopinfo) {
                        return data;
                    }
                    for (var i = 0; i < config.shopinfo.length; i++) {
                        if (parseInt(config.shopinfo[i][0]) === parseInt(data)) {
                            return config.shopinfo[i][1];
                        }
                    }
                    return data;
                }
            },
            {
                "data": "price",
                render: function(data) {
                    return data / 100.0;
                }
            },
            {
                "data": "status",
                render: function(data) {
                    for (var i = 0; i < config.chargestatus.length; i++) {
                        if (parseInt(config.chargestatus[i][0]) === parseInt(data)) {
                            return config.chargestatus[i][1];
                        }
                    }
                    return data;
                }
            },
            {
                "data": "trade_type",
                render: function(data) {
                    for (var i = 0; i < config.trade_type.length; i++) {
                        if (config.trade_type[i][0] === data) {
                            return config.trade_type[i][1];
                        }
                    }
                    return data;
                }
            },
            { "data": "err_code_des" },
        ]
    });

    $('#table-chargerecord tbody').on('click', 'tr', function() {
        $(this).parent().children("tr").removeClass("selected");
        $(this).addClass('selected');
    });

    $('#table-chargerecord tbody').on('dblclick', 'tr', function() {
        $(this).parent().children("tr").removeClass("selected");
    }); 

});

function getSelectData() {
    return proxyData.row('.selected').data();
}

function loadData() {
    proxyData.ajax.reload();
}