var RECORD_MAX_COUNT = 1000;

function setProperty(id) {
    // console.log(id);
    var selectData = getSelectData();
    if (!selectData) {
        return;
    }
    if (id === "authadjust") {
        selectData = {
            auth: selectData
        };
    }
    $("#" + id).setFormData(selectData);
}

function modalSubmit(id, isNew) {
    var selectData = {};
    if (!isNew) { // 新增数据 如果是新增数据 那么就不需要对表中数据进行获取
        selectData = getSelectData() || {};
    }
    var data = $("#" + id).getFormData() || {};
    if (id === "authadjust") {
        data = JSON.stringify(data.auth);
    }
    var param = {
        data: data,
        extra: selectData
    };
    console.log(param);
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
}