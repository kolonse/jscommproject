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
    });
}

function success(id) {
    $("#" + id).modal("hide");
    proxyData.ajax.reload();
}

function checkStatus(id) {
    var status = $("#" + id).find(".must").hasClass("has-error");
    if (status === false) {
        $("#" + id + "-submit").attr("disabled", false);
    }
}

var Param = {
    chargerecord: function(time, data) {
        return JSON.stringify({
            event: "payrecord",
            method: "find", //调用 count  方法 统计出数据记录数
            nextMethods: [{
                    method: "where",
                    arg: [{
                        "$and": [{ "data.time_start": { "$gte": moment(time.from).format("YYYYMMDDHHmmss") } }, { "data.time_start": { "$lte": moment(time.to).format("YYYYMMDDHHmmss") } }],
                        "data.uid": "" + data.uid
                    }, {
                        "_id": 0
                    }]
                },
                {
                    method: "sort",
                    arg: [
                        { "data.time_start": -1 }
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
        });
    },
    giverecord: function(time, data) {
        return JSON.stringify({
            event: "giverecord",
            method: "find", //调用 count  方法 统计出数据记录数
            nextMethods: [{
                    method: "where",
                    arg: [{
                        "$and": [{ "data.time": { "$gte": moment(time.from).format("YYYY-MM-DD HH:mm:ss") } }, { "data.time": { "$lte": moment(time.to).format("YYYY-MM-DD HH:mm:ss") } }],
                        "data.suid": "" + data.uid
                    }, {
                        "data.time": 1,
                        "data.rname": 1,
                        "data.ruid": 1,
                        "data.count": 1,
                        "_id": 0
                    }]
                },
                {
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
        });
    },
    receiverecord: function(time, data) {
        return JSON.stringify({
            event: "giverecord",
            method: "find", //调用 count  方法 统计出数据记录数
            nextMethods: [{
                    method: "where",
                    arg: [{
                        "$and": [{ "data.time": { "$gte": moment(time.from).format("YYYY-MM-DD HH:mm:ss") } }, { "data.time": { "$lte": moment(time.to).format("YYYY-MM-DD HH:mm:ss") } }],
                        "data.ruid": "" + data.uid
                    }, {
                        "data.time": 1,
                        "data.sname": 1,
                        "data.suid": 1,
                        "data.count": 1,
                        "_id": 0
                    }]
                },
                {
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
        });
    },
    reducerecord: function(time, data) {
        return JSON.stringify({
            event: "reducerecord",
            method: "find", //调用 count  方法 统计出数据记录数
            nextMethods: [{
                    method: "where",
                    arg: [{
                        "$and": [{ "data.time": { "$gte": moment(time.from).format("YYYY-MM-DD HH:mm:ss") } }, { "data.time": { "$lte": moment(time.to).format("YYYY-MM-DD HH:mm:ss") } }],
                        "data.uid": "" + data.uid
                    }, {
                        "data.time": 1,
                        "data.count": 1,
                        "data.remark": 1,
                        "_id": 0
                    }]
                },
                {
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
        });
    },
    historyrecord: function(time, data) {
        return JSON.stringify({
            event: "militaryexploit",
            method: "find", //调用 count  方法 统计出数据记录数
            nextMethods: [{
                    method: "where",
                    arg: [{
                        "$and": [{ "data.start": { "$gte": moment(time.from).format("YYYY-MM-DD HH:mm:ss") } }, { "data.start": { "$lte": moment(time.to).format("YYYY-MM-DD HH:mm:ss") } }],
                        "data.gameinfo": { "$regex": "_" + data.uid + " " }
                    }, {
                        "_id": 0
                    }]
                },
                {
                    method: "sort",
                    arg: [
                        { "data.start": -1 }
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
        });
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
        time.from = moment().subtract(1, "days").format("YYYY-MM-DDTHH:mm:ss");
    }
    if (!time.to || time.to.length === 0) {
        time.to = moment().format("YYYY-MM-DDTHH:mm:ss");
    }
    $("#datetime-" + id).setFormData(time);
    var cond = Param[id](time, data);
    var param = {
        cond: cond
    };
    $.post("/submitData/getMgoRecord", param, function(result, status, obj) {
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
        if (tabList[id]) {
            tabList[id].clear();
            tabList[id].rows.add(datas).draw();
        }
        // tabList[id].fnAdjustColumnSizing(false);
    }
}