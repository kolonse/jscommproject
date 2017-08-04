// 局数-消耗房卡数目
config.playtype = [
    ["4-1", "4局制"],
    ["8-2", "8局制"],
    ["12-3", "12局制"],
    ["16-4", "16局制"]
];
// 炮值数值
config.cannonvalue = [
    ["20", "20倍炮"],
    ["40", "40倍炮"],
    ["80", "80倍炮"],
    ["100", "100倍炮"]
];
// 子弹数-时间-翻倍子弹数
config.bulletcount = [
    ["500-180-250", "500发/局"],
    ["650-240-300", "650发/局"],
    ["850-300-400", "850发/局"],
    ["1000-360-500", "1000发/局"]
];

// 最大炮值
config.maxcannon = [
    ["100", "100倍炮"],
    ["500", "500倍炮"],
    ["1000", "1000倍炮"]
];
// 最小炮值
config.mincannon = [
    ["10", "10倍炮"],
    ["50", "50倍炮"],
    ["100", "100倍炮"]
];
// 默认炮值
config.defaultcannon = [
    ["10", "10倍炮"],
    ["50", "50倍炮"],
    ["100", "100倍炮"]
];
// 加炮幅度
config.cannonincrease = [
    ["10", "+/-10"],
    ["50", "+/-50"],
    ["100", "+/-100"]
];

config.hangtime = [
    ["-1", "不限制"],
    ["300000", "5min"],
    ["600000", "10min"]
];



// 渠道列表
config.channel = [
    [0, "全服"],
    [1, "安卓"],
    [2, "苹果"]
];
// 支付类型
config.paytype = [
    ["wxpublicpay", "微信公众号"],
    ["wxpay", "微信支付"],
    ["notopen", "不开放"]
];
// 是否开启赠送房卡
config.freecard = [
    ["open", "开启"],
    ["close", "关闭"]
];
// !-- 已经停用 --
config.sigleissueorders = [
    ["yes", "要求验证"],
    ["no", "无需验证"]
];
// !-- 已经停用 --
config.dayissueorders = [
    ["yes", "要求验证"],
    ["no", "无需验证"]
];
// 竞技场开关
config.fightroom = [
    ["open", "开启"],
    ["close", "关闭"]
];
// 聊天是否开启
config.textchat = [
    ["open", "开启"],
    ["close", "关闭"]
];
// 语音聊天是否开启
config.voicechat = [
    ["open", "开启"],
    ["close", "关闭"]
];
// 玩家私聊是否开启
config.playerchat = [
    ["open", "开启"],
    ["close", "关闭"]
];
// 工会限制
config.unionlimit = [
    ["open", "开启"],
    ["close", "关闭"]
];
// 游戏难度系数值
config.hardlevel = [
    ["1", "容易"],
    ["2", "较难"],
    ["3", "困难1*"],
    ["4", "困难2*"],
    ["5", "困难3*"]
];

// 金币场是否开启
config.goldroom = [
    ["open", "开启"],
    ["close", "关闭"]
];
// 房间限制
config.roomlimit = [
    ["open", "开启"],
    ["close", "关闭"]
];

// 金币兑回
config.auto2card = [
    ["true", "开启"],
    ["false", "关闭"]
];

config.chargestatus = [
    [-1, "全部"],
    [99, "充值成功"],
    [98, "充值失败"],
    [2, "发货失败"],
    [0, "订单创建"],
    [1, "价格不匹配"],
];

config.trade_type = [
    ["JSAPI", "微信公众号"],
    ["APP", "微信支付"]
];

config.hallstatus = [
    [0, "正常运营"],
    [1, "禁止登陆"],
    [2, "普通维护"],
    [3, "紧急维护"],
];

config.gameId = [
    [0, "房卡捕鱼"]
];

config.goldroomtype = [
    ["1", "公众场"],
    ["2", "经典玩法包间"],
    ["3", "夺宝玩法包间"]
];
var cfg = window.sessionStorage.getItem("config") || "{}";
cfg = JSON.parse(cfg);
// 设置动态配置数据
var dynamic = cfg.dynamic;
for (var key in dynamic) {
    config[key] = dynamic[key];
}
// 表格汉化
var DataTableLanguage = {
    "decimal": "",
    "emptyTable": "无任何数据",
    "info": "记录总数:_TOTAL_;当前显示 _START_ 到 _END_",
    "infoEmpty": "记录总数:0;当前显示 0 到 0",
    "infoFiltered": "(过滤后总数:_MAX_)",
    "infoPostFix": "",
    "thousands": ",",
    "lengthMenu": "每页显示 _MENU_ 条",
    "loadingRecords": "加载中...",
    "processing": "处理中...",
    "search": "搜索:",
    "zeroRecords": "未查询到匹配记录",
    "paginate": {
        "first": "首页",
        "last": "末页",
        "next": "下一页",
        "previous": "前一页"
    },
    "aria": {
        "sortAscending": ": 按列升序排序",
        "sortDescending": ": 按列降序排序"
    }
};

config.power = [
    [1, "一级管理员"],
    [2, "二级管理员"],
    [3, "三级管理员"]
];