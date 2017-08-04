$(function() {
    var vue = new Vue({
        el: 'html',
        data: config
    });

    var keyList = {};
    keyListInit("", config.sidebar);
    viewInit(config.sidebar);

    function keyListInit(prefix, node) {
        for (var i = 0; i < node.length; i++) {
            var item = node[i];
            if (!item.id) {
                throw new Error("sidebar " + i + " 必须配置 id");
            }
            var id = prefix + "." + item.id;
            if (prefix === "") {
                id = item.id;
            }
            if (keyList[id] !== undefined) {
                throw new Error(id + " 不能重复");
            }
            keyList[id] = i;
            if (item.isleaf === false) {
                keyListInit(id, item.node);
            }
        }
    }

    function viewInit(node) {
        var id = getId(location.href);
        var url = window.location;
        var element = $('ul.nav a').filter(function() {
            var thisId = getId(this.href);
            return thisId == id;
        }).addClass('active').parent().parent().addClass('in').parent();
        if (element.is('li')) {
            element.addClass('active');
        }
        $("#menu-leaf-" + id).addClass("navbar-selected");
        var name = getName(id, node);
        $(".phone-show").html("<i class='fa fa-angle-left'></i>&nbsp;&nbsp;" + name);
    }

    function getId(str) {
        var flag = str.lastIndexOf("/");
        var viewName = str.substr(flag + 1);
        flag = viewName.indexOf(".html");
        var id = viewName.substr(0, flag);
        return id;
    }

    function getName(id, node) {
        for (var i = 0; i < node.length; i++) {
            var item = node[i];
            if (!item.id) {
                throw new Error("sidebar " + i + " 必须配置 id");
            }

            if (id === item.id) {
                return item.name;
            }
            if (item.isleaf === false) {
                var name = getName(id, item.node);
                if (name.length !== 0) {
                    return name;
                }
            }
        }
        return "";
    }
});