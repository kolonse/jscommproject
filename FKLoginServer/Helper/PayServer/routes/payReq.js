var ErrorCode = require("../../../Common/ErrorCode");

module.exports = function(app){
    /**
     * 客户端支付请求接口 get/post 均支持
     * 客户端会发送支付请求 带有游戏的 appid,goodsid 字段
     * query:
     *  gappId
     *  goodsId
     */
    app.get("/payReq",function(req,res){
        var param = req.query ;
        processReq(param,function(data){
            res.json(data);
        });
    });
    app.post("/payReq",function(req,res){
        var param = req.body ;
        processReq(param,function(data){
            res.json(data);
        });
    });

    function processReq(param,cb){
        var res = {
            code:0,
            message:""
        };
        var gappId = param.gappId ;
        if(!gappId || gappId.length === 0) {
            res.code = ErrorCode.errorGGoodsid;
            res.message = "缺少 gappId";
            process.nextTick(function(){cb(res);});
            return;
        }
        var goodsId = param.goodsId ;
        if(!goodsId || goodsId.length === 0) {
            res.code = ErrorCode.errorGGoodsId;
            res.message = "缺少 goodsId";
            process.nextTick(function(){cb(res);});
            return;
        }
    }
}

