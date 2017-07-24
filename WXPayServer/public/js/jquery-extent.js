$(function() {
    $.fn.getselect = function() {
        var select = -1;
        $(this).children().each(function(index, o) {
            var cls = $(o).attr("class");
            if (/selected/.test(cls)) {
                select = index;
            }
        });
        return select;
    };
    var publicSpace = {};
    $.fn.writeData = function(key, value) {
        publicSpace[key] = value;
    };
    $.fn.readData = function(key) {
        return publicSpace[key];
    };

    function getElements(formId) {
        var form = document.getElementById(formId);
        var elements = [];
        var tagElements = form.getElementsByTagName('input');
        for (var j = 0; j < tagElements.length; j++) {
            elements.push(tagElements[j]);

        }
        return elements;
    }

    function inputSelector(element) {
        if (element.checked)
            return [element.name, element.value];
    }

    function getInput(element) {
        switch (element.type.toLowerCase()) {
            case 'submit':
            case 'hidden':
            case 'password':
            case 'text':
                return [element.name, element.value];
            case 'number':
                return [element.name, parseInt(element.value)];
            case 'date':
            case 'datetime-local':
                return [element.name, element.value];
            case 'checkbox':
            case 'radio':
                return inputSelector(element);
        }
        return null;
    }

    function setInput(element, value) {
        switch (element.type.toLowerCase()) {
            case 'submit':
            case 'hidden':
            case 'password':
            case 'text':
                if (value) { $(element).val(value); }
                return;
            case 'number':
                $(element).val(parseInt(value));
                return;
            case 'date':
            case 'datetime-local':
                $(element).val(value);
                return;
            case 'checkbox':
            case 'radio':
                if (value) { $(element).attr("checked", value); }
                return;
        }
        return null;
    }
    var externList = [];
    var autoId = 0;
    $.fn.externForm = function(cls, childCls, getVal, setVal) {
        if (childCls instanceof Function) {
            getVal = childCls;
            childCls = "--1-nothing--";
        }
        externList.push({
            cls: cls,
            childCls: childCls,
            getVal: getVal,
            setVal: setVal
        });
    };
    $.fn.setFormData = function(data) {
        if (data === undefined) return;
        $(this).children().each(function(_i, o) {
            var cls = $(o).attr("class") || "";
            for (var i = 0; i < externList.length; i++) {
                if (cls.indexOf(externList[i].cls) !== -1) {
                    var name = $(o).attr("name");
                    if (!name) return;
                    if (!externList[i].setVal) return;
                    var func = externList[i].setVal.bind(o);
                    func(data[name]);
                    return;
                }
                if (cls.indexOf(externList[i].childCls) !== -1) {
                    return;
                }
            }
            // 判断 元素类型是否是 input
            var _name = "";
            switch ($(o)[0].tagName.toLowerCase()) {
                case "input":
                    _name = $(o).attr("name");
                    if (!_name) return;
                    setInput($(o)[0], data[_name]);
                    break;
                case 'textarea':
                    _name = $(o).attr("name");
                    if (!_name) return;
                    $(o).val(data[_name]);
                    break;
                default:
                    $(o).setFormData(data);
                    break;
            }
        });
    };
    $.fn.getFormData = function() {
        var obj = {};
        $(this).children().each(function(_i, o) {
            var cls = $(o).attr("class") || "";
            for (var i = 0; i < externList.length; i++) {
                if (cls.indexOf(externList[i].cls) !== -1) {
                    var name = $(o).attr("name");
                    if (!name) return;
                    var func = externList[i].getVal.bind(o);
                    obj[name] = func();
                    return;
                }
                if (cls.indexOf(externList[i].childCls) !== -1) {
                    return;
                }
            }
            // 判断 元素类型是否是 input
            var _name = "";
            switch ($(o)[0].tagName.toLowerCase()) {
                case "input":
                    _name = $(o).attr("name");
                    if (!_name) return;
                    value = getInput($(o)[0]) || [null, null];
                    obj[_name] = value[1];
                    break;
                case 'textarea':
                    _name = $(o).attr("name");
                    if (!_name) return;
                    obj[_name] = $(o).val();
                    break;
                default:
                    {
                        var childObj = $(o).getFormData();
                        for (var key in childObj) {
                            obj[key] = childObj[key];
                        }
                    }
                    break;
            }
        });
        return obj;
    };
});