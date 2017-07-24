/**
 * Created by Administrator on 2015/9/30.
 */
var Sequelize = require("sequelize");
//var Store = require("./Mongo");
module.exports = function(config){
    var seqArcadeFishPay = new Sequelize(config["ArcadeFishPay"].database,config["ArcadeFishPay"].user,config["ArcadeFishPay"].password,{
        host:config["ArcadeFishPay"].host,
        port:config["ArcadeFishPay"].port,
        dialect:'mysql',
        pool:{
            max:config["ArcadeFishPay"].connectNum,
            min:0,
            idle:config["ArcadeFishPay"].idleTimeoutMillis
        },
        timezone:'+08:00',
        logging:global.logger.debug
    });

    var ret = {
        PayRecord:seqArcadeFishPay.define("PayRecord",{
            ID: { type:Sequelize.INTEGER,primaryKey:true},
            uid:{type:Sequelize.INTEGER},
            orderId:{type:Sequelize.STRING},
            goodsId:{type:Sequelize.INTEGER},
            price:{type:Sequelize.INTEGER},
            description:{type:Sequelize.STRING},
            status:{type:Sequelize.INTEGER},
            channel:{type:Sequelize.STRING},
            account:{type:Sequelize.STRING},
            beginTime:{type:Sequelize.STRING},
            finishTime:{type:Sequelize.STRING},
            receipt:{type:Sequelize.TEXT},
            extra:{type:Sequelize.TEXT},
            goodsType:{type:Sequelize.INTEGER},
            serverID:{type:Sequelize.INTEGER},
            isTest:{type:Sequelize.BOOLEAN},
            payChannel:{type:Sequelize.STRING},
			clientPayCode:{type:Sequelize.INTEGER},
			clientPayChannel:{type:Sequelize.STRING},
			clientPayExtra:{type:Sequelize.TEXT}
        },{
            freezeTableName:true,
            timestamps:false
        })
    }
    for(var key in ret){
        ret[key].sync() ;
    }
    return ret ;
}
