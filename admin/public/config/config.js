var CONFIG = {
    "title": "房卡捕鱼管理后台系统",
    "version": "1.0.9.0052",
    "username": "",
    "sidebar": [{
            "id": "systemmanager",
            "isleaf": false,
            "name": "系统管理",
            "node": [{
                    "id": "systemsetting",
                    "isleaf": true,
                    "name": "系统设置"
                },
                {
                    "id": "gamesetting",
                    "isleaf": true,
                    "name": "游戏设置"
                },
                {
                    "id": "usermanager",
                    "isleaf": true,
                    "name": "用户管理"
                }
            ]
        },
        {
            "id": "vipmanager",
            "isleaf": false,
            "name": "会员管理",
            "node": [{
                    "id": "proxymanager",
                    "isleaf": true,
                    "name": "代理员管理"
                },
                {
                    "id": "labourunion",
                    "isleaf": true,
                    "name": "工会管理"
                },
                {
                    "id": "unionermanager",
                    "isleaf": true,
                    "name": "正/副会长管理"
                },
                {
                    "id": "playermanager",
                    "isleaf": true,
                    "name": "玩家管理"
                }
            ]
        },
        {
            "id": "gameparam",
            "isleaf": false,
            "name": "一般运作",
            "node": [{
                    "id": "hallmanager",
                    "isleaf": true,
                    "name": "大厅管理"
                },
                {
                    "id": "gamenotice",
                    "isleaf": true,
                    "name": "游戏公告"
                },
                {
                    "id": "syclemessage",
                    "isleaf": true,
                    "name": "滚动消息"
                },
                {
                    "id": "militaryexploitsquery",
                    "isleaf": true,
                    "name": "战绩查询"
                },
                {
                    "id": "issueorders",
                    "isleaf": true,
                    "name": "玩家补单"
                }
            ]
        },
        {
            "id": "incomeanalysis",
            "isleaf": false,
            "name": "运营分析",
            "node": [{
                "id": "chargerecord",
                "isleaf": true,
                "name": "充值订单"
            }, {
                "id": "issuerecord",
                "isleaf": true,
                "name": "补单记录"
            }, {
                "id": "gamechargeitem",
                "isleaf": true,
                "name": "充值统计"
            }, {
                "id": "gamecardgive",
                "isleaf": true,
                "name": "每日赠送"
            }, {
                "id": "gamecarduse",
                "isleaf": true,
                "name": "房卡消耗"
            }, {
                "id": "gamewinstatic",
                "isleaf": true,
                "name": "游戏盈利"
            }, {
                "id": "gamecarditem",
                "isleaf": true,
                "name": "房卡账单"
            }, {
                "id": "gamegolditem",
                "isleaf": true,
                "name": "金币账单"
            }]
        },
        {
            "id": "qbackanalysis",
            "isleaf": true,
            "name": "客诉信息"
        },
        {
            "id": "waringlog",
            "isleaf": true,
            "name": "警报日志"
        }
    ]
};

config = CONFIG;