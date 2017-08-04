var moment = require("moment");
var ip = require("ip");
module.exports = function(app) {
    app.post("/logout", function(req, res) {
        var token = req.cookies.fcadmin;
        app.dbhelper.deleteToken(token, function() {
            res.json({
                code: 0
            });
        });
    });
};