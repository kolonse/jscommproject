var ErrorCode = {
    errorLogicBase: 10100, // 内部逻辑错误
    errorLogin: 10101, // 登录 异常
    errorCheck: 10102, // 验证 异常
    errorExpired: 10103, // 登录过期

    errorParamBase: 20100, // 参数错误类型
    errorAccessToken: 20101, // token 字段错误
    errorTicket: 20102, // ticket 字段错误
    errorDeviceId: 20103, // ticket 字段错误
    errorSystem: 20104, // ticket 字段错误
    errorVersion: 20105, // ticket 字段错误
    errorUid: 20106, // ticket 字段错误
    errorPromoter: 20107, // promoter 字段错误

    errorDBBase: 30100, // 数据库错误类型
    errorQuery: 30101, // 查询类型错误
    errorStore: 30102, // 存储类型错误
};

module.exports = ErrorCode;