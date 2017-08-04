/**
 * Created by Administrator on 2016/1/8.
 */
var Promise = require("promise");
var thisModule = "updateNoticeJob";
var util = require("util");
var moment = require("moment");
var HttpClient = require("../../HttpClient/HttpClient.js");
var NOTICE_UPDATE_JOB_INTERVAL = 60000;
module.exports = function(app) {
    var configLoader = app.config;
    var noticeUrl = app.config.get("noticeServerUrl");

    function getAllNotice(today) {
        return new Promise(function(fulfill, reject) {
            app.dbhelper.read("notice", { beginDate: { lte: today }, "$or": [{ status: app.Common.NOTICE_STATUS.NotStart }, { status: app.Common.NOTICE_STATUS.Noticing }] }, function(err, datas) {
                if (err) {
                    reject(err);
                    return;
                }
                var notices = {};
                for (var i = 0; i < datas.length; i++) {
                    notices[datas[i].dataValues.id] = datas[i].dataValues;
                }
                fulfill({
                    today: today,
                    notices: notices
                });
            });
        });
    }

    function modify(notice, toStatus) {
        notice.status = toStatus;
        return new Promise(function(fulfill, reject) {
            app.dbhelper.update("notice", notice, { id: notice.id }, function(err) {
                if (err) {
                    app.logger.warn("%s | 公告 %j 修改异常,err:", thisModule, notice, err);
                }
                fulfill();
            });
        });
    }

    function checkNotices(datas) {
        var today = datas.today;
        var notices = datas.notices;
        var results = {};
        var stopNoticejobs = [];
        var noticingJobs = []; // 公告中的 JOB
        for (var key in notices) {
            var notice = notices[key];
            // 如果公告过期 那么将公告要修改为公告结束
            if (notice.endDate < today) {
                stopNoticejobs.push(modify(notice, app.Common.NOTICE_STATUS.Ended));
            } else if (notice.status === app.Common.NOTICE_STATUS.NotStart) {
                noticingJobs.push(modify(notice, app.Common.NOTICE_STATUS.Noticing));
                results[key] = notice;
            } else {
                results[key] = notice;
            }
        }
        Promise.all(stopNoticejobs); // 将所有过期公告一起停止
        Promise.all(noticingJobs); // 将所有过期公告一起停止
        return new Promise(function(fulfill) {
            fulfill(results);
        });
    }

    function notifyUpdate(data) {
        return new Promise(function(fulfill, reject) {
            var http = HttpClient();
            http.post(noticeUrl, data, function(err, result) {
                if (err) { reject(err); return; }
                if (result.code !== 0) {
                    reject(new Error(result.message));
                    return;
                }
                fulfill();
            });
        });
    }
    // 需要将本地的记录和新记录进行比较
    // 1.需要判断关键字数量是否一致 数量一致那么需要判断内容是否一致 如果完全一致那么需要判断更新时间是否一致
    // 2.数量不一致 需要更新 那么直接更新内容
    function checkResults(notices) {
        var localNotices = configLoader.get("localNotices");
        if (localNotices && Object.keys(localNotices).length === Object.keys(notices).length) {
            var same = true;
            for (var key in localNotices) {
                if (!notices[key]) {
                    same = false;
                    break;
                }
                if (moment(localNotices[key].updatedAt).format("YYYY-MM-DD HH:mm:ss") !== moment(notices[key].updatedAt).format("YYYY-MM-DD HH:mm:ss")) {
                    same = false;
                    break;
                }
            }
            if (same) {
                return new Promise(function(fulfill) { fulfill(false); });
            }
        }
        var updateList = {};
        var index = 0;
        for (var key2 in notices) {
            updateList[index] = {
                title: notices[key2].noticeTitle,
                content: notices[key2].noticeContent
            };
            index++;
        }
        // 不一致情况 更新逻辑
        var now = moment().format("YYYY-MM-DD HH:mm:ss.SSS");
        var data = {
            updateTime: now,
            data: updateList
        };

        function updateSuccess() {
            // 更新成功替换 本地缓存
            configLoader.update("localNotices", notices);
            return new Promise(function(fulfill) { fulfill(true); });
        }

        function updateFail(err) {
            return new Promise(function(fulfill, reject) { reject(err); });
        }
        return notifyUpdate(data)
            .then(updateSuccess)
            .catch(updateFail);
    }

    function over(hasUpdate) {
        if (hasUpdate) {
            app.logger.info("%s | 有公告更新 公告更新任务处理结束", thisModule);
        } else {
            app.logger.info("%s | 无任何公告更新 公告更新任务处理结束", thisModule);
        }
        setTimeout(go, NOTICE_UPDATE_JOB_INTERVAL);
    }

    function error(err) {
        app.logger.error("%s | 公告更新任务处理异常,err:", thisModule, err);
        setTimeout(go, NOTICE_UPDATE_JOB_INTERVAL);
    }

    function go() {
        app.logger.info("%s | 开始一次公告任务处理", thisModule);
        var today = moment().format("YYYY-MM-DDTHH:mm:ss");
        getAllNotice(today).then(checkNotices).then(checkResults).then(over).catch(error);
    }
    setTimeout(go, 10000);
};