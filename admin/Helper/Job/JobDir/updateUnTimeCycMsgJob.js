/**
 * Created by Administrator on 2016/8/17.
 */
var Promise = require("promise");
var thisModule = "updateUnTimeCycMsgJob";
var util = require("util");
var moment = require("moment");
var HttpClient = require("../../HttpClient/HttpClient.js");
// 时间滴答滴答每一步走动的单位大小
var NOTICE_UPDATE_JOB_INTERVAL = 60000;
module.exports = function(app) {
    var configLoader = app.config;
    var noticeUrl = app.config.get("sycmessageServerUrl");

    function getUnTimeCycMsg(today) {
        return new Promise(function(fulfill, reject) {
            app.dbhelper.read("unTimeCycleMessage", { startTime: { lte: today }, "$or": [{ status: app.Common.NOTICE_STATUS.NotStart }, { status: app.Common.NOTICE_STATUS.Noticing }] }, [], null, [
                ['id', 'desc']
            ], function(err, datas) {
                if (err) {
                    reject(err);
                    return;
                }

                var unTimeCycMsg = {};
                for (var i = 0; i < datas.length; i++) {
                    unTimeCycMsg[datas[i].dataValues.id] = datas[i].dataValues;
                }

                fulfill({
                    today: today,
                    unTimeCycMsg: unTimeCycMsg
                });
            });
        });
    }

    function modify(value, status) {
        value.status = status;
        return new Promise(function(fulfill, reject) {
            app.dbhelper.update("unTimeCycleMessage", value, { id: value.id }, function(err) {
                if (err) {
                    app.logger.warn("%s | 不定时循环消息 %j 修改异常,err:", thisModule, value, err);
                }
                fulfill();
            });
        });
    }

    function checkUnTimeCycMsg(datas) {
        var today = datas.today;
        var unTimeCycMsg = datas.unTimeCycMsg;
        var results = {};
        var stopNoticejobs = [];
        var noticingJobs = []; // 公告中的 JOB
        for (var key in unTimeCycMsg) {
            var notice = unTimeCycMsg[key];
            if (notice.endTime < today) {
                stopNoticejobs.push(modify(notice, app.Common.NOTICE_STATUS.Ended));
            } else if (notice.status === app.Common.NOTICE_STATUS.NotStart) {
                noticingJobs.push(modify(notice, app.Common.NOTICE_STATUS.Noticing));
                results[key] = notice;
            } else {
                results[key] = notice;
            }
        }
        Promise.all(stopNoticejobs); // 将所有过期公告一起停止
        Promise.all(noticingJobs);
        return new Promise(function(fulfill) {
            fulfill(results);
        });
    }

    function notifyUpdate(data) {
        return new Promise(function(fulfill, reject) {
            var http = HttpClient();
            http.post(noticeUrl, data, function(err, result) {
                if (err) {
                    reject(err);
                    return;
                }
                if (result.code !== 0) {
                    reject(new Error(result.message));
                    return;
                }
                fulfill();
            });
        });
    }

    function checkResults(unTimeCycMsg) {
        var unTimeCycMessages = configLoader.get("unTimeCycMessages");
        var same = true;
        if (unTimeCycMessages && Object.keys(unTimeCycMessages).length === Object.keys(unTimeCycMsg).length) {
            for (var key in unTimeCycMsg) {
                if (!unTimeCycMessages[key]) {
                    same = false;
                    break;
                }
                if (moment(unTimeCycMsg[key].updatedAt).format("YYYY-MM-DD HH:mm:ss") !== moment(unTimeCycMessages[key].updatedAt).format("YYYY-MM-DD HH:mm:ss")) {
                    same = false;
                    break;
                }
            }
            if (same) {
                return new Promise(function(fulfill) {
                    fulfill(false);
                });
            }
        }
        var updateList = {};
        var index = 0;
        for (var k in unTimeCycMsg) {
            updateList[index] = {
                channel: unTimeCycMsg[k].broadcastChannel,
                content: unTimeCycMsg[k].broadcastContent
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
            configLoader.update("unTimeCycMessages", unTimeCycMsg);
            return new Promise(function(fulfill) {
                fulfill(true);
            });
        }

        function updateFail(err) {
            return new Promise(function(fulfill, reject) {
                reject(err);
            });
        }

        return notifyUpdate(data)
            .then(updateSuccess)
            .catch(updateFail);
    }

    function over(hasUpdate) {
        if (hasUpdate) {
            app.logger.info("%s | 有不定时循环消息更新 不定时循环消息更新任务处理结束", thisModule);
        } else {
            app.logger.info("%s | 无任何不定时循环消息更新 不定时循环消息更新任务处理结束", thisModule);
        }
        setTimeout(go, NOTICE_UPDATE_JOB_INTERVAL);
    }

    function error(err) {
        app.logger.error("%s | 不定时循环消息更新任务处理异常,err:", __file, err);
        setTimeout(go, NOTICE_UPDATE_JOB_INTERVAL);
    }

    function go() {
        var today = moment().format("YYYY-MM-DDTHH:mm:ss");
        getUnTimeCycMsg(today)
            .then(checkUnTimeCycMsg)
            .then(checkResults)
            .then(over)
            .catch(error);
    }

    setTimeout(go, 8000);
};