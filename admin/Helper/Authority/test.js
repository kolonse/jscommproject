var auth = require("./index.js");

var req = {
    path: "/getData/mysql/proxy",
    fcadmin: "admin",
    body: {
        id: "/getData/mysql/proxy"
    }
};

var res = {
    json: function() {
        console.log(arguments);
    }
};

var next = function() {
    req.updateauth({ username: "test1", power: 1 }, '{\"systemmanager\":{\"value\":true,\"child\":{\"systemsetting\":{\"value\":true,\"child\":{}},\"gamesetting\":{\"value\":true,\"child\":{}},\"usermanager\":{\"value\":true,\"child\":{\"query\":{\"value\":true,\"child\":{}},\"adminunfreeze\":{\"value\":true,\"child\":{}},\"addadmin\":{\"value\":true,\"child\":{}},\"authadjust\":{\"value\":false,\"child\":{}},\"deleteadmin\":{\"value\":false,\"child\":{}},\"resetadminpassword\":{\"value\":false,\"child\":{}}}}}},\"vipmanager\":{\"value\":true,\"child\":{\"proxymanager\":{\"value\":true,\"child\":{\"query\":{\"value\":true,\"child\":{}},\"addProxy\":{\"value\":true,\"child\":{}},\"resetPassword\":{\"value\":true,\"child\":{}},\"freeze\":{\"value\":true,\"child\":{}},\"unfreeze\":{\"value\":true,\"child\":{}},\"addunionmaxcount\":{\"value\":true,\"child\":{}},\"resetSharing\":{\"value\":true,\"child\":{}},\"modify\":{\"value\":true,\"child\":{}}}},\"labourunion\":{\"value\":true,\"child\":{}},\"unionermanager\":{\"value\":true,\"child\":{}},\"playermanager\":{\"value\":true,\"child\":{\"query\":{\"value\":true,\"child\":{}},\"playerfreeze\":{\"value\":true,\"child\":{}},\"playerunfreeze\":{\"value\":true,\"child\":{}},\"increasecard\":{\"value\":true,\"child\":{}},\"reducecard\":{\"value\":true,\"child\":{}},\"changepromoter\":{\"value\":true,\"child\":{}}}}}},\"gameparam\":{\"value\":true,\"child\":{\"hallmanager\":{\"value\":true,\"child\":{}},\"gamenotice\":{\"value\":true,\"child\":{\"query\":{\"value\":true,\"child\":{}},\"closenotice\":{\"value\":true,\"child\":{}},\"gamenotice\":{\"value\":true,\"child\":{}}}},\"syclemessage\":{\"value\":true,\"child\":{\"query\":{\"value\":true,\"child\":{}},\"closesyclemessage\":{\"value\":true,\"child\":{}},\"syclemessage\":{\"value\":true,\"child\":{}}}},\"militaryexploitsquery\":{\"value\":true,\"child\":{}},\"orderSubmit\":{\"value\":true,\"child\":{}}}},\"incomeanalysis\":{\"value\":true,\"child\":{\"pay\":{\"value\":true,\"child\":{}},\"issueorder\":{\"value\":true,\"child\":{}}}}}');
};

var r = auth({
    dbhelper: {
        read: function() {
            var f = null;
            for (var i in arguments) {
                f = arguments[i];
            }
            f(null, [{
                dataValues: {
                    "username": "test1",
                    "power": 1,
                    "powerdiy": ""
                }
            }]);
        }
    },
    ErrorCode: {
        errorAuth: 1
    }
});

r(req, res, next);