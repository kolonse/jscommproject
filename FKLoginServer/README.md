# 微信登录服务 #
登录服务有两种方式,公众号登录和手机APP登录.对应的访问端口分别为14003,14001.对外接口格式两个服务均相同.
在使用登录服务前,确保公众号和app的应用已经申请通过,并且在一个开放平台上都已经绑定完成,然后需要配置 config/config.js 文件中 WXPhoneServer 和 WXPublicServer两个项目配置.将对应的appid和secret都填写完成,如果需要使用微信模拟测试环境服务器,将url配置成https://127.0.0.1:14000/,并且确保TestPlat为true.在正式线上部署时确保不能使用测试环境.

目前登录服务提供给房卡捕鱼使用,app对应地址`https://login.youdianle.com/app`,公众号对应登录地址`https://login.youdianle.com/public`
均支持get,post. get请求用于做测试,参数通过url query方式传递;post用于线上,参数通过body传递,格式为json.
以下接口介绍以 app 进行介绍,公众号只要将 /app 换成 /public即可.

***1. /wxLogin***
>
>     完整地址:https://login.youdianle.com/app/wxLogin
>     loginAppId int,必须,在注册应用时生成.
>     deviceId string,必须,请求端的设备id,用于日志记录.
>     system string,必须,请求端的系统类型，例如：android/ios
>     version string,必须,请求端版本号,用于日志记录.
>     ticket object,必须,请求端在吊起微信登录时,微信返回的凭证,需要将微信登录返回的所有内容都放到ticket中.例如:
>     {code:"xx"}

完整 wxLogin 参数格式例子(post):

    {
    	"deviceId":"",
    	"system":"",
    	"version":"",
		"loginAppId":0,
    	"ticket":{
    		"code":""
    	}
    }

**请求返回结果:**

>     code int,0 表示成功,其他失败.
>     message string,当 code 不为0时,表示失败信息
>     access_token string,用于校验用户合法性的 token.
>     uid int,用户游戏 id 号.

完整返回结果例子:

    {
    	"code":0,
    	"message":"",
    	"access_token":"",
    	"uid":0
    }

***2. /wxCheck***

>     access_token string,必须,值为 wxLogin 返回的值.
>     uid int,必须,值为 wxLogin 返回的值.
>     system string,必须,必须和wxLogin传递值一致.
>     deviceId string,必须,必须和wxLogin传递值一致.
>     loginAppId int,必须,在注册应用时生成.

**请求返回结果:**

>     code int,0表示成功,其他失败.
>     message string,当 code 不为0时,表示失败信息.
>     nickname string,用户昵称.
>     headimgurl string,用户头像地址.
>     sex int,1表示男,2表示女.

完整返回结果例子:

    {
    	"code":0,
    	"message":"",
    	"nickname":"",
    	"sex":0,
		"headimgurl":""
    }

***3. /readUser***

>     where object,必填,表示读取用户信息的条件,参考 sequelize中where填写格式.
>     attr array,必填,表示需要读取的属性列表,参考 sequelize中attributes填写格式

**响应:**

    {
    	"code":0,
    	"message":"",
    	"data":{
		}
    }

***4.注册应用***

调用接口 POST /registerApp,参数格式如下:

    {
	    "appName":"登录平台-APP",
	    "appid":"",
	    "secret":"",
	    "type":"APP",// JSAPI 表示公众号类型,APP 表示app类型
		"url":"https://api.weixin.qq.com/",//表示微信服务地址,如需要测试不接入微信,使用 https://127.0.0.1:14000
    }

反馈结果如下表示成功,所有参数都需要保证正确,否则会出现异常:

    {
      "code": 0,
      "message": "",
      "data": {
      	"loginAppId": 0,// int 值,需要记住该 appid
      }
    }
    

其中 loginAppId 非常重要,需要在调用wxLogin,wxCheck接口中使用.