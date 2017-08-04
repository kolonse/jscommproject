module.exports.DEFAULT_PASSWARD = "123456";

module.exports.PLAYER_STATUS = {
    except: -1,
    freeze: 1,
    unfreeze: 0
};

module.exports.NOTICE_STATUS = {
    NotStart: "尚未开始",
    Noticing: "公告中",
    Close: "关闭",
    Ended: "结束"
};

module.exports.ORDER_STATUS = {
    success: 0,
    fail: -1
};

module.exports.UNIONER_TYPE = {
    unioner: 0, //会长
    viceunioner: 1 // 副会长
};

module.exports.WARN_STATUS = {
    wait_unlock: 0,
    unlocked: 1,
    ignore: 2
};

module.exports.POWER = {
    ROOT: "root"
};

module.exports.FEEDBACK_STATUS = {
    wait_feedback: 0,
    feedbacked: 1,
    ignore: 2
};

module.exports.PROXY_SUFFIX = "p";

module.exports.ERROR_PASS_MAX_COUNT = 10;
module.exports.ERROR_PASS_CACHE_TIME = 60 * 60 * 1000;