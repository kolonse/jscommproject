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
                if (result.code === 20100) {
                    $("#" + id + "-submit").attr("disabled", true);
                    if ($("#" + id).find(".must").hasClass("has-error")) {
                        $("#" + id).find(".must").focus();
                    }
                }
                fail(result.code, result.message);
                return;
            }
            success(id);
        } else {
            fail(-1, "服务异常");
        }

        function success(id) {
            proxyData.ajax.reload();
            $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
        }
    });
}


function checkStatus(id) {
    var status = $("#" + id).find(".must").hasClass("has-error");
    if (status === false) {
        $("#" + id + "-submit").attr("disabled", false);
    }
}

var Param = {
    uniondetail: function(time, data) {
        return {
            url: "/submitData/getUnionDetail", // 获取工会描述详细信息
            cond: JSON.stringify({
                id: data.id
            })
        };
    },
    cardcost: function(time, data) {
        return {
            url: "/submitData/mysql/unioncarduse",
            cond: JSON.stringify({
                where: {
                    unionId: data.id,
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
            url: "/submitData/mysql/unioncharge",
            cond: JSON.stringify({
                where: {
                    unionId: data.id,
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
            url: "/submitData/mysql/unionnewuser",
            cond: JSON.stringify({
                where: {
                    unionId: data.id,
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
            url: "/submitData/mysql/uniononlineuser",
            cond: JSON.stringify({
                where: {
                    unionId: data.id,
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
    unionerlist: function(time, data) {
        return {
            url: "/submitData/mysql/unioner",
            cond: JSON.stringify({
                where: {
                    unionId: data.id
                },
                attr: ["id", "playerGameId", "sharingrate", "createdAt"]
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
            success(id, param.success ? param.success(result.data) : result.data);
        } else {
            fail(-1, "服务异常");
        }
    });

    function success(id, datas) {
        if (tabList[id]) {
            tabList[id].clear();
            tabList[id].draw(datas);
        }
    }
}