/**
 * 权限控制策略
 */

module.exports = {
    0: {
        "systemmanager": {
            "value": true,
            "child": {
                "systemsetting": {
                    "value": true,
                    "path": "/updateConfig",
                    "id": "systemmanager/systemsetting"
                },
                "gamesetting": {
                    "value": true,
                    "path": "/updateConfig",
                    "id": "systemmanager/gamesetting"
                },
                "usermanager": {
                    "value": true,
                    "child": {
                        "query": {
                            "value": true,
                            "path": "/getData/adminusers",
                        },
                        "adminunfreeze": {
                            "value": true,
                            "path": "/submitData/adminunfreeze",
                        },
                        "addadmin": {
                            "value": true,
                            "path": "/submitData/addadmin",
                        },
                        "authadjust": {
                            "value": true,
                            "path": "/submitData/authadjust",
                        },
                        "deleteadmin": {
                            "value": true,
                            "path": "/submitData/deleteadmin",
                        },
                        "resetadminpassword": {
                            "value": true,
                            "path": "/submitData/resetadminpassword",
                        }
                    }
                }
            }
        },
        "vipmanager": {
            "value": true,
            "child": {
                "proxymanager": {
                    "value": true,
                    "child": {
                        "query": {
                            "value": true,
                            "path": "/getData/mysql/proxy",
                        },
                        "addProxy": {
                            "value": true,
                            "path": "/submitData/addProxy",
                        },
                        "resetPassword": {
                            "value": true,
                            "path": "/submitData/resetPassword",
                        },
                        "freeze": {
                            "value": true,
                            "path": "/submitData/freeze",
                        },
                        "unfreeze": {
                            "value": true,
                            "path": "/submitData/unfreeze",
                        },
                        "addunionmaxcount": {
                            "value": true,
                            "path": "/submitData/addunionmaxcount",
                        },
                        "resetSharing": {
                            "value": true,
                            "path": "/submitData/resetSharing",
                        },
                        "modify": {
                            "value": true,
                            "path": "/submitData/modify",
                        }
                    }
                },
                "labourunion": {
                    "value": true,
                    "path": "/getData/mysql/union",
                },
                "unionermanager": {
                    "value": true,
                    "path": "/getData/mysql/unioner",
                },
                "playermanager": {
                    "value": true,
                    "child": {
                        "query": {
                            "value": true,
                            "path": "/getData/mysql/roles",
                        },
                        "playerfreeze": {
                            "value": true,
                            "path": "/submitData/playerfreeze",
                        },
                        "playerunfreeze": {
                            "value": true,
                            "path": "/submitData/playerunfreeze",
                        },
                        "increasecard": {
                            "value": true,
                            "path": "/submitData/increasecard",
                        },
                        "reducecard": {
                            "value": true,
                            "path": "/submitData/reducecard",
                        },
                        "changepromoter": {
                            "value": true,
                            "path": "/submitData/changepromoter",
                        }
                    }
                }
            }
        },
        "gameparam": {
            "value": true,
            "child": {
                "hallmanager": {
                    "value": true,
                    "path": "/updateConfig",
                    "id": "gameparam/hallmanager"
                },
                "gamenotice": {
                    "value": true,
                    "child": {
                        "query": {
                            "value": true,
                            "path": "/getData/mysql/notice",
                        },
                        "closenotice": {
                            "value": true,
                            "path": "/submitData/closenotice",
                        },
                        "gamenotice": {
                            "value": true,
                            "path": "/submitData/gamenotice",
                        }
                    }
                },
                "syclemessage": {
                    "value": true,
                    "child": {
                        "query": {
                            "value": true,
                            "path": "/getData/mysql/unTimeCycleMessage",
                        },
                        "closesyclemessage": {
                            "value": true,
                            "path": "/submitData/closesyclemessage",
                        },
                        "syclemessage": {
                            "value": true,
                            "path": "/submitData/syclemessage",
                        }
                    }
                },
                "militaryexploitsquery": {
                    "value": true,
                    "path": "/getData/mongo/militaryexploit",
                },
                "orderSubmit": {
                    "value": true,
                    "path": "/submitData/orderSubmit",
                }
            }
        },
        "incomeanalysis": {
            "value": true,
            "child": {
                "pay": {
                    "value": true,
                    "path": "/getData/mysql/pay"
                },
                "issueorder": {
                    "value": true,
                    "path": "/getData/mysql/issueorder"
                },
            }
        },
    },
    1: {
        "systemmanager": {
            "value": true,
            "child": {
                "systemsetting": {
                    "value": true,
                    "path": "/updateConfig",
                    "id": "systemmanager/systemsetting"
                },
                "gamesetting": {
                    "value": true,
                    "path": "/updateConfig",
                    "id": "systemmanager/gamesetting"
                },
                "usermanager": {
                    "value": true,
                    "child": {
                        "query": {
                            "value": true,
                            "path": "/getData/adminusers",
                        },
                        "adminunfreeze": {
                            "value": true,
                            "path": "/submitData/adminunfreeze",
                        },
                        "addadmin": {
                            "value": true,
                            "path": "/submitData/addadmin",
                        },
                        "authadjust": {
                            "value": true,
                            "path": "/submitData/authadjust",
                        },
                        "deleteadmin": {
                            "value": true,
                            "path": "/submitData/deleteadmin",
                        },
                        "resetadminpassword": {
                            "value": true,
                            "path": "/submitData/resetadminpassword",
                        }
                    }
                }
            }
        },
        "vipmanager": {
            "value": true,
            "child": {
                "proxymanager": {
                    "value": true,
                    "child": {
                        "query": {
                            "value": true,
                            "path": "/getData/mysql/proxy",
                        },
                        "addProxy": {
                            "value": true,
                            "path": "/submitData/addProxy",
                        },
                        "resetPassword": {
                            "value": true,
                            "path": "/submitData/resetPassword",
                        },
                        "freeze": {
                            "value": true,
                            "path": "/submitData/freeze",
                        },
                        "unfreeze": {
                            "value": true,
                            "path": "/submitData/unfreeze",
                        },
                        "addunionmaxcount": {
                            "value": true,
                            "path": "/submitData/addunionmaxcount",
                        },
                        "resetSharing": {
                            "value": true,
                            "path": "/submitData/resetSharing",
                        },
                        "modify": {
                            "value": true,
                            "path": "/submitData/modify",
                        }
                    }
                },
                "labourunion": {
                    "value": true,
                    "path": "/getData/mysql/union",
                },
                "unionermanager": {
                    "value": true,
                    "path": "/getData/mysql/unioner",
                },
                "playermanager": {
                    "value": true,
                    "child": {
                        "query": {
                            "value": true,
                            "path": "/getData/mysql/roles",
                        },
                        "playerfreeze": {
                            "value": true,
                            "path": "/submitData/playerfreeze",
                        },
                        "playerunfreeze": {
                            "value": true,
                            "path": "/submitData/playerunfreeze",
                        },
                        "increasecard": {
                            "value": true,
                            "path": "/submitData/increasecard",
                        },
                        "reducecard": {
                            "value": true,
                            "path": "/submitData/reducecard",
                        },
                        "changepromoter": {
                            "value": true,
                            "path": "/submitData/changepromoter",
                        }
                    }
                }
            }
        },
        "gameparam": {
            "value": true,
            "child": {
                "hallmanager": {
                    "value": true,
                    "path": "/updateConfig",
                    "id": "gameparam/hallmanager"
                },
                "gamenotice": {
                    "value": true,
                    "child": {
                        "query": {
                            "value": true,
                            "path": "/getData/mysql/notice",
                        },
                        "closenotice": {
                            "value": true,
                            "path": "/submitData/closenotice",
                        },
                        "gamenotice": {
                            "value": true,
                            "path": "/submitData/gamenotice",
                        }
                    }
                },
                "syclemessage": {
                    "value": true,
                    "child": {
                        "query": {
                            "value": true,
                            "path": "/getData/mysql/unTimeCycleMessage",
                        },
                        "closesyclemessage": {
                            "value": true,
                            "path": "/submitData/closesyclemessage",
                        },
                        "syclemessage": {
                            "value": true,
                            "path": "/submitData/syclemessage",
                        }
                    }
                },
                "militaryexploitsquery": {
                    "value": true,
                    "path": "/getData/mongo/militaryexploit",
                },
                "orderSubmit": {
                    "value": true,
                    "path": "/submitData/orderSubmit",
                }
            }
        },
        "incomeanalysis": {
            "value": true,
            "child": {
                "pay": {
                    "value": true,
                    "path": "/getData/mysql/pay"
                },
                "issueorder": {
                    "value": true,
                    "path": "/getData/mysql/issueorder"
                },
            }
        },
    },
    2: {
        "systemmanager": {
            "value": false,
            "child": {
                "systemsetting": {
                    "value": true,
                    "path": "/updateConfig",
                    "id": "systemmanager/systemsetting"
                },
                "gamesetting": {
                    "value": true,
                    "path": "/updateConfig",
                    "id": "systemmanager/gamesetting"
                },
                "usermanager": {
                    "value": true,
                    "child": {
                        "query": {
                            "value": true,
                            "path": "/getData/adminusers",
                        },
                        "adminunfreeze": {
                            "value": true,
                            "path": "/submitData/adminunfreeze",
                        },
                        "addadmin": {
                            "value": true,
                            "path": "/submitData/addadmin",
                        },
                        "authadjust": {
                            "value": true,
                            "path": "/submitData/authadjust",
                        },
                        "deleteadmin": {
                            "value": true,
                            "path": "/submitData/deleteadmin",
                        },
                        "resetadminpassword": {
                            "value": true,
                            "path": "/submitData/resetadminpassword",
                        }
                    }
                }
            }
        },
        "vipmanager": {
            "value": true,
            "child": {
                "proxymanager": {
                    "value": true,
                    "child": {
                        "query": {
                            "value": true,
                            "path": "/getData/mysql/proxy",
                        },
                        "addProxy": {
                            "value": true,
                            "path": "/submitData/addProxy",
                        },
                        "resetPassword": {
                            "value": true,
                            "path": "/submitData/resetPassword",
                        },
                        "freeze": {
                            "value": true,
                            "path": "/submitData/freeze",
                        },
                        "unfreeze": {
                            "value": true,
                            "path": "/submitData/unfreeze",
                        },
                        "addunionmaxcount": {
                            "value": true,
                            "path": "/submitData/addunionmaxcount",
                        },
                        "resetSharing": {
                            "value": true,
                            "path": "/submitData/resetSharing",
                        },
                        "modify": {
                            "value": true,
                            "path": "/submitData/modify",
                        }
                    }
                },
                "labourunion": {
                    "value": true,
                    "path": "/getData/mysql/union",
                },
                "unionermanager": {
                    "value": true,
                    "path": "/getData/mysql/unioner",
                },
                "playermanager": {
                    "value": true,
                    "child": {
                        "query": {
                            "value": true,
                            "path": "/getData/mysql/roles",
                        },
                        "playerfreeze": {
                            "value": true,
                            "path": "/submitData/playerfreeze",
                        },
                        "playerunfreeze": {
                            "value": true,
                            "path": "/submitData/playerunfreeze",
                        },
                        "increasecard": {
                            "value": true,
                            "path": "/submitData/increasecard",
                        },
                        "reducecard": {
                            "value": true,
                            "path": "/submitData/reducecard",
                        },
                        "changepromoter": {
                            "value": true,
                            "path": "/submitData/changepromoter",
                        }
                    }
                }
            }
        },
        "gameparam": {
            "value": true,
            "child": {
                "hallmanager": {
                    "value": false,
                    "path": "/updateConfig",
                    "id": "gameparam/hallmanager"
                },
                "gamenotice": {
                    "value": true,
                    "child": {
                        "query": {
                            "value": true,
                            "path": "/getData/mysql/notice",
                        },
                        "closenotice": {
                            "value": true,
                            "path": "/submitData/closenotice",
                        },
                        "gamenotice": {
                            "value": true,
                            "path": "/submitData/gamenotice",
                        }
                    }
                },
                "syclemessage": {
                    "value": true,
                    "child": {
                        "query": {
                            "value": true,
                            "path": "/getData/mysql/unTimeCycleMessage",
                        },
                        "closesyclemessage": {
                            "value": true,
                            "path": "/submitData/closesyclemessage",
                        },
                        "syclemessage": {
                            "value": true,
                            "path": "/submitData/syclemessage",
                        }
                    }
                },
                "militaryexploitsquery": {
                    "value": true,
                    "path": "/getData/mongo/militaryexploit",
                },
                "orderSubmit": {
                    "value": true,
                    "path": "/submitData/orderSubmit",
                }
            }
        },
        "incomeanalysis": {
            "value": true,
            "child": {
                "pay": {
                    "value": true,
                    "path": "/getData/mysql/pay"
                },
                "issueorder": {
                    "value": true,
                    "path": "/getData/mysql/issueorder"
                },
            }
        },
    },
    3: {
        "systemmanager": {
            "value": false,
            "child": {
                "systemsetting": {
                    "value": true,
                    "path": "/updateConfig",
                    "id": "systemmanager/systemsetting"
                },
                "gamesetting": {
                    "value": true,
                    "path": "/updateConfig",
                    "id": "systemmanager/gamesetting"
                },
                "usermanager": {
                    "value": true,
                    "child": {
                        "query": {
                            "value": true,
                            "path": "/getData/adminusers",
                        },
                        "adminunfreeze": {
                            "value": true,
                            "path": "/submitData/adminunfreeze",
                        },
                        "addadmin": {
                            "value": true,
                            "path": "/submitData/addadmin",
                        },
                        "authadjust": {
                            "value": true,
                            "path": "/submitData/authadjust",
                        },
                        "deleteadmin": {
                            "value": true,
                            "path": "/submitData/deleteadmin",
                        },
                        "resetadminpassword": {
                            "value": true,
                            "path": "/submitData/resetadminpassword",
                        }
                    }
                }
            }
        },
        "vipmanager": {
            "value": true,
            "child": {
                "proxymanager": {
                    "value": false,
                    "child": {
                        "query": {
                            "value": true,
                            "path": "/getData/mysql/proxy",
                        },
                        "addProxy": {
                            "value": true,
                            "path": "/submitData/addProxy",
                        },
                        "resetPassword": {
                            "value": true,
                            "path": "/submitData/resetPassword",
                        },
                        "freeze": {
                            "value": true,
                            "path": "/submitData/freeze",
                        },
                        "unfreeze": {
                            "value": true,
                            "path": "/submitData/unfreeze",
                        },
                        "addunionmaxcount": {
                            "value": true,
                            "path": "/submitData/addunionmaxcount",
                        },
                        "resetSharing": {
                            "value": true,
                            "path": "/submitData/resetSharing",
                        },
                        "modify": {
                            "value": true,
                            "path": "/submitData/modify",
                        }
                    }
                },
                "labourunion": {
                    "value": false,
                    "path": "/getData/mysql/union",
                },
                "unionermanager": {
                    "value": false,
                    "path": "/getData/mysql/unioner",
                },
                "playermanager": {
                    "value": true,
                    "child": {
                        "query": {
                            "value": true,
                            "path": "/getData/mysql/roles",
                        },
                        "playerfreeze": {
                            "value": true,
                            "path": "/submitData/playerfreeze",
                        },
                        "playerunfreeze": {
                            "value": true,
                            "path": "/submitData/playerunfreeze",
                        },
                        "increasecard": {
                            "value": false,
                            "path": "/submitData/increasecard",
                        },
                        "reducecard": {
                            "value": false,
                            "path": "/submitData/reducecard",
                        },
                        "changepromoter": {
                            "value": true,
                            "path": "/submitData/changepromoter",
                        }
                    }
                }
            }
        },
        "gameparam": {
            "value": true,
            "child": {
                "hallmanager": {
                    "value": false,
                    "path": "/updateConfig",
                    "id": "gameparam/hallmanager"
                },
                "gamenotice": {
                    "value": true,
                    "child": {
                        "query": {
                            "value": true,
                            "path": "/getData/mysql/notice",
                        },
                        "closenotice": {
                            "value": true,
                            "path": "/submitData/closenotice",
                        },
                        "gamenotice": {
                            "value": true,
                            "path": "/submitData/gamenotice",
                        }
                    }
                },
                "syclemessage": {
                    "value": true,
                    "child": {
                        "query": {
                            "value": true,
                            "path": "/getData/mysql/unTimeCycleMessage",
                        },
                        "closesyclemessage": {
                            "value": true,
                            "path": "/submitData/closesyclemessage",
                        },
                        "syclemessage": {
                            "value": true,
                            "path": "/submitData/syclemessage",
                        }
                    }
                },
                "militaryexploitsquery": {
                    "value": true,
                    "path": "/getData/mongo/militaryexploit",
                },
                "orderSubmit": {
                    "value": false,
                    "path": "/submitData/orderSubmit",
                }
            }
        },
        "incomeanalysis": {
            "value": false,
            "child": {
                "pay": {
                    "value": true,
                    "path": "/getData/mysql/pay"
                },
                "issueorder": {
                    "value": true,
                    "path": "/getData/mysql/issueorder"
                },
            }
        },
    },
};