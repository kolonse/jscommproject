function CDM(self, child, father, whiteList) {
    this.self = null;
    this.child = null;
    this.father = null;
    this.MMap = {};
    this.Init(self, child, father, whiteList);
}
/**
 * 监听事件继承 如果创建两个 CDM 时 由于监听事件 回调函数会被改掉 所以需要继承一下
 * @param cdm
 */
CDM.prototype.inheritListenerEvent = function(cdm) {
    for (var key in cdm.MMap) {
        this.MMap[key] = cdm.MMap[key];
    }
    return this;
};

CDM.prototype._cb = function(data) {
    if (data.event && this.MMap[data.event]) {
        this.MMap[data.event](data.data);
    } else {
        this.console.log("not support");
    }
};

CDM.prototype.Init = function(self, child, father, whiteList) {
    this.self = self;
    this.child = child;
    this.father = father;
    this.console = console;
    this.JSON = JSON;
    var se = this;

    function checkWhiteList(origin) {
        for (var i = 0; i < whiteList.length; i++) {
            if (origin === whiteList[i] || whiteList[i] === "*") {
                return true;
            }
        }
        return false;
    }

    function messageHandler(e) {
        if (checkWhiteList(e.origin)) {
            se._cb(e.data);
        } else {
            se.console.log(e.origin, "not in whiteList,", whiteList);
        }
    }
    this.self.addEventListener("message", messageHandler, true);
    return this;
};

CDM.prototype.Register = function(event, cb) {
    this.MMap[event] = cb;
    return this;
};

CDM.prototype.Post = function(event, data, dstDomain) {
    this.child.postMessage({
        event: event,
        data: data
    }, dstDomain);
    return this;
};

CDM.prototype.Request = function(event, data, dstDomain, cb) {
    this.Post(event, data, dstDomain);
    this.Register(event + "Rsp", cb);
    return this;
};

CDM.prototype.Response = function(event, data, dstDomain) {
    this.father.postMessage({
        event: event + "Rsp",
        data: data
    }, dstDomain);
    return this;
};