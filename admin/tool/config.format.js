var fs = require("fs");
var KString = require("./format");
fs.writeFileSync(process.argv[3], new KString(new String(fs.readFileSync(process.argv[2])))
    .Set(process.argv[4], process.argv[5]).Get());