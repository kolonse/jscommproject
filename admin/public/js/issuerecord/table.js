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
            url: '/getData/mysql/issueorder',
            type: 'POST',
            data: function(v) {
                var cond = $("#query-cond").getFormData();
                v.where = {
                    "$and": [
                        { "createdAt": { "$gte": moment(cond.from).format("YYYY-MM-DD HH:mm:ss") } },
                        { "createdAt": { "$lte": moment(cond.to).format("YYYY-MM-DD HH:mm:ss") } }
                    ]
                };
                var shopid = parseInt(cond.shopinfo.defaultValue);
                if (!isNaN(shopid) && shopid !== -1) {
                    v.where.shop = shopid;
                }
                v.attr = ["createdAt", "admin", "uid", "shop", "uid", "reason"];
            }
        },
        "columns": [{
                "data": "createdAt",
                render: function(data) {
                    return moment(data).format("YYYY-MM-DD HH:mm:ss");
                }
            },
            {
                "data": "admin"
            },
            {
                "data": "uid"
            },
            {
                "data": "shop",
            },
            {
                "data": "shop",
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
                "data": "reason",
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
            }
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