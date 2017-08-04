var RECORD_MAX_COUNT = 1000;

function setProperty(id) {
    // console.log(id);
    var selectData = getSelectData();
    if (!selectData) {
        return;
    }
    $("#" + id).setFormData(selectData);
}

function modalSubmit(id, isNew) {
    var selectData = {};
    if (!isNew) { // 新增数据 如果是新增数据 那么就不需要对表中数据进行获取
        selectData = getSelectData() || {};
    }
    var data = $("#" + id).getFormData() || {};
    var param = {
        data: data,
        extra: selectData
    };
    $.post("/submitData/" + id, param, function(result, status, obj) {
        if (status === "success") {
            if (result.code !== 0) {
                fail(result.code, result.message);
                return;
            }
            success(id);
        } else {
            fail(-1, "服务异常");
        }
    });
}

function success(id) {
    $("#" + id).modal("hide");
    proxyData.ajax.reload();
    $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
}

function checkStatus(id) {
    var status = $("#" + id).find(".must").hasClass("has-error");
    if (status === false) {
        $("#" + id + "-submit").attr("disabled", false);
    }
}

var Param = {
    proxydetail: function(time, data) {
        return {
            url: "/submitData/getProxyDetail", // 获取工会描述详细信息
            cond: JSON.stringify({
                id: data.id
            })
        };
    },
    cardcost: function(time, data) {
        return {
            url: "/submitData/mysql/proxycarduse",
            cond: JSON.stringify({
                where: {
                    proxyId: data.id,
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
                    ["count", "value"]
                ],
                order: [
                    ["date", "asc"]
                ]
            })
        };
    },
    cardcharge: function(time, data) {
        return {
            url: "/submitData/mysql/proxycharge",
            cond: JSON.stringify({
                where: {
                    proxyId: data.id,
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
                    ["money", "value"]
                ],
                order: [
                    ["date", "asc"]
                ]
            })
        };
    },
    newplayer: function(time, data) {
        return {
            url: "/submitData/mysql/proxynewuser",
            cond: JSON.stringify({
                where: {
                    proxyId: data.id,
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
                    ["count", "value"]
                ],
                order: [
                    ["date", "asc"]
                ]
            })
        };
    },
    activeplayer: function(time, data) {
        return {
            url: "/submitData/mysql/proxyonlineuser",
            cond: JSON.stringify({
                where: {
                    proxyId: data.id,
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
                    ["count", "value"]
                ],
                order: [
                    ["date", "asc"]
                ]
            })
        };
    },
    personalintests: function(time, data) {
        return {
            url: "/submitData/mysql/proxyincome",
            cond: JSON.stringify({
                where: {
                    proxyId: data.id,
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
                    ["money", "value"]
                ],
                order: [
                    ["date", "asc"]
                ]
            })
        };
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
                    "data.admin": data.username,
                    "data.type": "proxy"
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