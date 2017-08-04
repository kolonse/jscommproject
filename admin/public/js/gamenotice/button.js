
function setProperty(id){
    // console.log(id);
    var selectData = getSelectData();
    if(!selectData){
        return ;
    }
    console.log(selectData);
    $("#" + id).setFormData(selectData);
}

function modalSubmit(id,isNew){
    var selectData = {} ;
    if(!isNew){ // 新增数据 如果是新增数据 那么就不需要对表中数据进行获取
        selectData = getSelectData() || {};
    }
    var data = $("#" + id).getFormData() || {};
    var param = {
        data:data,
        extra:selectData
    };
    $.post("/submitData/" + id, param, function (result, status, obj) {
        if (status === "success") {
            if (result.code !== 0) {
                if(result.code === 20100){
                    $("#" + id + "-submit").attr("disabled",true);
                    if($("#" + id).find(".must").hasClass("has-error")){
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

function success(id){
     $("#" + id).modal("hide");
     proxyData.ajax.reload();
}
function checkStatus(id){
    var status = $("#" + id).find(".must").hasClass("has-error");
    if(status === false){
        $("#" + id + "-submit").attr("disabled",false);
    }
}