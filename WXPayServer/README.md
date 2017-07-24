# 微信付费接口介绍 #

- 简要说明

目前付费服务支持公众号支付和手机支付,其他服务方式未进行联调。

- 接入步骤

**1.注册应用**

调用接口 POST /registerApp,参数格式如下:

    {
    	"appName":"房卡捕鱼支付测试",
    	"trade_type":"JSAPI",
    	"loginserverUrl":"http://127.0.0.1:14003/",
    	"orderquery":"https://api.mch.weixin.qq.com/pay/orderquery",
    	"unfiedorder":"https://api.mch.weixin.qq.com/pay/unifiedorder",
    	"mch_id":"1451820702",
    	"mch_body":"房卡捕鱼-房卡支付",
    	"mch_key":"5ouIH7Bqd075gbGo4wvz2na86K2jFph8",
    	"appid":"wx2b54cdf28427315e",
    	"expire":1440,
    	"notify_url":"http://wxpublic.youdianle.com.cn/pay/api/notify",
    	"jsapi":"pay.html",
    	"game_notify_url":"http://192.168.1.96:18001/do/buygoods"
    }

反馈结果如下表示成功,所有参数都需要保证正确,否则会出现异常:

    {
      "code": 0,
      "message": "",
      "data": {
	    "payAppId": int value,
	    "do": "/do"
      }
    }
    

其中 payAppId 非常重要,需要在调用下单,查询接口中使用.

**2.公众号入口配置(手机app支付忽略这一步)**

付费入口地址为:

    http://wxpublic.youdianle.com.cn/wxpay/do?payAppId=${payAppId}

微信付费公众号的入口地址是:

    https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx2b54cdf28427315e&redirect_uri=http%3a%2f%2fwxpublic.youdianle.com.cn%2fwxpay%2fdo%3fpayAppId%3d${payAppId}&response_type=code&scope=snsapi_userinfo&state=wxpay#wechat_redirect

${payAppId} 替换成上面的你的 payAppId

微信扫描二维码进行测试:

![微信扫描二维码测试](http://qrcode.youdianle.com.cn/qrcode?bdmaxsize=2&content=https%3a%2f%2fopen.weixin.qq.com%2fconnect%2foauth2%2fauthorize%3fappid%3dwx2b54cdf28427315e%26redirect_uri%3dhttp%253a%252f%252fwxpublic.youdianle.com.cn%252fpay%252fdo%253fpayAppId%253dSmE76xx1QUmDGw9vimC%2b9A%3d%3d%26response_type%3dcode%26scope%3dsnsapi_userinfo%26state%3dwxpay%23wechat_redirect)

**3.订单接口**

POST /wxpay/api/submit

Body:

    {
    	"uid":0,
    	"payAppId":your payAppId,
		"shopid":"you shopid"
    }

返回结果,code 为 0表示成功,其他失败

应用类型为 JSAPI 时,返回结果如下:

    {
    		"code":0, 
    		"message":"",
    		"data":{
    			"appId":"your wx appid",
    			"timeStamp":0,
    			"nonceStr":"server nonce",
    			"package":"prepay_id=server prepay_id",
    			"signType":"MD5",
				"paySign":"server pay sign"
    			"orderId":""
    		}
    }

应用类型为 APP 时,返回结果如下:

    {
    		"code":0, 
    		"message":"",
    		"data":{
                "appid": appid,
                "partnerid": mch_id,
                "prepayid": data.prepay_id,
                "package": "Sign=WXPay",
                "noncestr": "",
				"sign":"server sign"
                "timestamp": 0,
				"orderId":""
    		}
    }

客户端需要通过服务器返回的这个 data 内容进行调用起微信支付.

**4.订单查询**

POST /wxpay/api/query

Body:

    {
    	"orderId":"订单接口 返回的 orderId",
    	"payAppId":your apyAppId
    }

返回结果,code 为 0表示请求,其他失败,trade_state 表示本次交易成功与否

    {
    		"code":0, 
    		"message":"",
    		"data":{
    			"trade_state":""
    		}
    }

订单查询请求是在客户端完成微信支付流程后,需要进行调用接口进行查询,来最终保证订单是正确的.
该请求不应该在吊起微信支付完成后理解调用,最好在延时1秒后调用一次,如果没有成功那么在延时一秒调用一次,持续3次.