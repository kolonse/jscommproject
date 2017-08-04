var ErrorCode = {
    errorLogicBase: 10100, // 内部逻辑错误
    errorUnlogin: 10101, // 未登录异常
    errorNotExist: 10102, // 不存在异常
    errorAuth: 10103, //权限错误

    errorParamBase: 20100, // 参数错误类型
    errorUsername: 20101,
    errorPassword: 20102,
    errorCCap: 20103,
    errorDBBase: 30100, // 数据库错误类型
    errorRead: 30101, // 读取数据错误
    errorWrite: 30102,

    errorRemoteCall: 40100, //远程调用失败
    errorUpdateConfig: 40101, // 更新配置失败
};

module.exports = ErrorCode;