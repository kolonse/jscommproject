var ErrorCode = {
    errorLogicBase: 10100, // 内部逻辑错误
    errorAppidExist: 10101, // appid 已经存在
    errorOrderNotExist: 10102, //订单不存在

    errorParamBase: 20100, // 参数错误类型
    errorGameName: 20101, // 游戏名字错误
    errorNotifyUrl: 20102, // 回调通知url填写错误
    errorGAppid: 20103, // 游戏 appid 错误
    errorGGoodsId: 20104, // 游戏 goodsid 错误
    errorKey: 20105, // 游戏 key 错误
    errorValue: 20106, // 游戏 value 错误

    errorDBBase: 30100, // 数据库错误类型
    errorRegisterGame: 30101, //注册游戏异常
    errorUpdateGame: 30101, //注册游戏异常

    errorRemote: 40100, // 远程调用错误类型


    errorState: 50100, // 状态类型错误
    errorTranidNull: 50101, // 微信订单 id 为空
};

module.exports = ErrorCode;