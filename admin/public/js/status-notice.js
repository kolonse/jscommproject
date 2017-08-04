$(function() {
    function getStatus(cb) {
        $.post("/submitData/getStatusNotice", function(result, status, obj) {
            if (status === "success") {
                if (result.code !== 0) {
                    fail(result.code, result.message);
                    return;
                }
                setStatus(result.data);
                cb();
                // success(id, result.data);
            } else {
                fail(10101, "服务异常,需要重新登录");
            }
        });

    }

    function run() {
        getStatus(function() {
            setTimeout(function() {
                run();
            }, 30000);
        });

    }
    run();


    function setStatus(data) {
        for (var key in data) {
            setMark(key, data[key]);
        }
    }

    function setMark(key, value) {
        if (value) {
            $("#menu-leaf-" + key).addClass("newnotice");
        } else {
            $("#menu-leaf-" + key).removeClass("newnotice");
        }
    }
});