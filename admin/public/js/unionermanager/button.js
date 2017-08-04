var RECORD_MAX_COUNT = 1000;
var Param = {
    income: function(time, data) {
        if (data.type === 0) {
            return {
                url: "/submitData/mysql/leaderincome",
                cond: JSON.stringify({
                    where: {
                        leader: data.id,
                        "$and": [{
                            date: {
                                "$gte": moment(time.from).format("YYYY-MM-DD")
                            }
                        }, {
                            date: {
                                "$lte": moment(time.to).format("YYYY-MM-DD")
                            }
                        }]
                    },
                    attr: [
                        ["date", "key"],
                        ["total", "value"]
                    ],
                    order: [
                        ["date", "asc"]
                    ]
                })
            };
        } else {
            return {
                url: "/submitData/mysql/leaderincome",
                cond: JSON.stringify({
                    where: {
                        leader: data.id,
                        "$and": [{
                            date: {
                                "$gte": moment(time.from).format("YYYY-MM-DD")
                            }
                        }, {
                            date: {
                                "$lte": moment(time.to).format("YYYY-MM-DD")
                            }
                        }]
                    },
                    attr: [
                        ["date", "key"],
                        ["selfmoney", "value"]
                    ],
                    order: [
                        ["date", "asc"]
                    ]
                })
            };
        }
    },
    loginiprecord: function(time, data) {
        return {
            url: "/submitData/getMgoRecord",
            cond: JSON.stringify({
                event: "loginrecord",
                method: "find", //调用 count  方法 统计出数据记录数
                arg: [{
                    // "data.admin": "admin",
                    // "data.type": "admin",
                    "data.admin": "" + data.id,
                    "data.type": "union"
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
    }
};


function loadData(id) {
    var data = getSelectData();
    if (!data) {
        return;
    }
    if (!id || !Param[id]) {
        return;
    }
    var time = $("#datetime-" + id).getFormData();
    if (!time.from || time.from.length === 0) {
        time.from = moment().subtract(8, "days").format("YYYY-MM-DD");
    }
    if (!time.to || time.to.length === 0) {
        time.to = moment().subtract(1, "days").format("YYYY-MM-DD");
    }
    $("#datetime-" + id).setFormData(time);
    var param = Param[id](time, data);
    $.post(param.url, { cond: param.cond }, function(result, status, obj) {
        if (status === "success") {
            if (result.code !== 0) {
                fail(result.code, result.message);
                return;
            }
            success(id, result.data);
        } else {
            fail(-1, "服务异常");
        }
    });

    function success(id, datas) {
        tabList[id].clear();
        tabList[id].draw(datas);
    }
}