logger = require('../../logger.js');

GHError = require("../Error.js");

error = new GHError(0,"111");
logger.info(error)

var uuid = require("../uuid.js");

var func = require("../CommonFunction.js");
err = func.CheckParam({
    a:"number",
    b:"string",
    d:"string"
}, {
    a:123,
    b:"fdsfd",
    c:2
})
console.log(err);
//for( i = 0; i < 1000; i ++ ){
//    setInterval(function(){
//        console.log( uuid.v4() );
//    },0);
//}
console.log( uuid.v4().length );
