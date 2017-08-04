var pageStr = null;
$(function(){
	function formatArray(keyIndex,data){
		var s = "";
		var l = keyIndex.length;
		s += "<tr style='cursor:pointer;'>"
		for(var i = 0;i < data.length && i < l;i ++){
			s += "<td>" + data[keyIndex[i]] + "</td>"
		}
		s += "</tr>"
		return s;
	}
	
	function formatObject(keyIndex,data){
		var s = "";
		s += "<tr style='cursor:pointer;'>"
		for(var i = 0;i < keyIndex.length;i ++){
			s += "<td>" + data[keyIndex[i]] + "</td>"
		}
		s += "</tr>"
		return s;
	}
	
	$.fn.setTableData = function(datas){		
		var id = $(this).attr("id");
		var storeData = $(this).readData(id);

		if(!storeData){
			return ;
		}
		var keyIndex = storeData.keyIndex;
		if(!keyIndex){
			return ;
		}	
		
		var html = "";	
		for(var i = 0;i < datas.length;i ++){
			if(datas[i] instanceof Object){
				html += formatObject(keyIndex,datas[i]);
			}else if(datas[i] instanceof Array){
				html += formatArray(keyIndex,datas[i]);
			}
		}
		$($($($(this).children(".k-table-data")[0]).children("table")[0]).children("tbody")).html(html);
		$(this).resetCurCount();
		refreshEvent(this);
	}
	$.fn.appendTableData = function(datas){
		var id = $(this).attr("id");
		var storeData = $(this).readData(id);
		if(!storeData){
			return ;
		}
		var keyIndex = storeData.keyIndex;
		if(!keyIndex){
			return ;
		}
		var html = $($($($(this).children(".k-table-data")[0]).children("table")[0]).children("tbody")).html();	
		for(var i = 0;i < datas.length;i ++){
			if(datas[i] instanceof Object){
				html += formatObject(keyIndex,datas[i]);
			}else if(datas[i] instanceof Array){
				html += formatArray(keyIndex,datas[i]);
			}
		}	
		$($($($(this).children(".k-table-data")[0]).children("table")[0]).children("tbody")).html(html);
		$(this).resetCurCount();
		refreshEvent(this);
	}
	$.fn.getTableCount = function(){
		return $($($($(this).children(".k-table-data")[0]).children("table")[0]).children("tbody")).children("tr").length;
	}
	$.fn.resetCurCount = function(count){
		var id = $(this).attr("id");
		var did = "detail_" + id;
		
		var total = parseInt($("#" + did).attr("total"));
		count = count || $(this).getTableCount();
		$("#" + did).attr("cur",count);
		$("#" + did).html(pageStr.Set("cur",count).Set("total",total).Get());	
	}
	$.fn.resetTotalCount = function(count){
		var id = $(this).attr("id");
		var did = "detail_" + id;
		
		var cur = parseInt($("#" + did).attr("cur"));
		count = count || -1;
		$("#" + did).attr("total",count);
		$("#" + did).html(pageStr.Set("cur",cur).Set("total",count).Get());	
	}
	pageStr = new KString("当前  ${cur} 条,总共数据条数 ${total} 条")
	function drawPaper(o){
		var id = $(o).attr("id");
		var refreshStr = $(o).attr("onrefresh");
		refreshStr = refreshStr || "pageDefaultRefresh()";
		var storeData = $(o).readData(id) || {};
		storeData.onrefreshstr = refreshStr;
		$(o).writeData(id,storeData);
		$(o).children(".paper-plugin").html(new KString(
	       '<div class="clearfix">' +
		     '<div class="float-left">' +
		        '<div class="btn btn_1 btn-default mrg5R" id="btn_refresh_${id}" onclick="pageRefresh(this)">' +
		           '<i class="fa fa-refresh"> </i>' +
		        '</div>' +
		        '<div class="clearfix"> </div>' +
		    '</div>' +
		    '<div class="float-right">' +		       			              
	            '<span class="text-muted m-r-sm" cur="0" total="-1" id="detail_${id}">当前 0 条,总共数据条数 -1 条</span>' +
	            '<div class="btn-group">' +
//	                '<a class="btn btn-default" onclick="pageLeft(this)" id="btn_left_${id}"><i class="fa fa-angle-left"></i></a>' +
	                '<a class="btn btn-default" onclick="pageRight(this)" id="btn_right_${id}"><i class="fa fa-angle-right"></i></a>' +
	            '</div>' +
		    '</div>' +
	       '</div>')
			.Set("id",id)
//			.Set("refreshStr",refreshStr)
			.Get()
		);
	}
	
	function parseHead(p,id){
		var storeData = $(p).readData(id) || {};
		var keyIndex = storeData.keyIndex;
		if(!keyIndex){
			keyIndex = [] ;
		}
		var index = $(p).attr("dataIndex");
		var styled = $(p).attr("style") || "";
		var name = $(p).html();
		keyIndex.push(index);
		storeData.keyIndex = keyIndex;
		$(p).writeData(id,storeData);
		return new KString("<th style='${style}'>${name}</th>")
			.Set("style",styled)
			.Set("name",name)
			.Get();
	}
	
	function drawTable(o){
		var id = $(o).attr("id");
		var dataList = $($(o).children(".k-table-data")[0]).children("p");
		var htmlHead = "<tr>";
		for(var i = 0;i < dataList.length;i ++){
			var p = dataList[i];
			htmlHead += parseHead(p,id);
		}
		htmlHead += "</tr>"
		$(o).children(".k-table-data").html(new KString("<table class='table'><thead>${head}</thead><tbody></tbody></table>")
			.Set("head",htmlHead)
			.Get()
		);
		var html = $(o).html();
		
		html += '<div class="k-table-tips">加载中...</div>'
		$(o).html(html);
		// 处理加载开始 继续 结束 函数
		var storeData = $(o).readData(id) || {};
		
		var onbeginStr = $(o).attr("onbegin");
		onbeginStr = onbeginStr || "tableDefaultBegin()";
		storeData.onbeginStr = onbeginStr;

		var onnextStr = $(o).attr("onnext");
		onnextStr = onnextStr || "tableDefaultNext()";
		storeData.onnextStr = onnextStr;

		var onendStr = $(o).attr("onend");
		onendStr = onendStr || "tableDefaultEnd()";
		storeData.onendStr = onendStr;
		
		$(o).writeData(id,storeData);
		
		_tableCall(o, onbeginStr);
	}
	$(".k-table").each(function(index,o){
		var id = $(o).attr("id") || uuid.v4();
		$(o).attr("id",id);
		drawPaper(o);
		drawTable(o);
		$(o).children(".k-table-tips").addClass("alert alert-success");
		$(o).children(".k-table-tips").attr("role","alert");
		$(o).children(".k-table-tips").css("display","none");
		$(o).scroll(function(){
			var wh = $(this).height();
			var sh = $(this).scrollTop();
			var dh = getTableData(this).height();
			var tid = $(this).attr("id");
			var storeData = $(this).readData(id);
			var onnextStr = storeData.onnextStr;
			var self = this;
			if(wh + sh >= dh + 20){
				var loadState = storeData.loadState || false ;
				if(loadState){
					return ;
				}
				storeData.loadState = true ;
				$(this).writeData(tid,storeData);
				$(this).children(".k-table-tips").css("display","block");
				_tableCall(this,onnextStr,function(datas){
					$(self).appendTableData(datas);
					$(self).children(".k-table-tips").css("display","none");
					storeData.loadState = false ;
					$(self).writeData(tid,storeData);
				});
			}
		})
	})
	
	function getTBody(_this){
		return $($($($(_this).children(".k-table-data")[0]).children("table")[0]).children("tbody"))
	}
	function getTableData(_this){
		return $($(_this).children(".k-table-data")[0])
	}
	function refreshEvent(o){
		$(o).children(".k-table-data").children("table").children("tbody").children("tr").on("click", function () {
	        $(this).parent().find("tr.info").toggleClass("info");//取消原先选中行
	        $(this).toggleClass("info");//设定当前行为选中行
	    });		
	}
})

function pageRight(o){
	var id = $(o).attr("id");
	var pid = "#" + id.substr("btn_right_".length);
	var storeData = $(pid).readData(pid.substr(1));
	var onnextStr = storeData.onnextStr;
	$(pid).children(".k-table-tips").css("display","block");
	var loadState = storeData.loadState || false ;
	if(loadState){
		return ;
	}
	storeData.loadState = true ;
	$(this).writeData(pid,storeData);
	_tableCall($(pid),onnextStr,function(datas){
		$(pid).appendTableData(datas);
		$(pid).children(".k-table-tips").css("display","none");
		storeData.loadState = false ;
		$(pid).writeData(pid,storeData);
	});
}

function pageRefresh(o){
	var id = $(o).attr("id");
	var tid = id.substr("btn_refresh_".length);
	var storeData = $(o).readData(tid);
	var onbeginStr = storeData.onbeginStr;
	_tableCall($("#" + tid),onbeginStr);
}

function pageDefaultRefresh(o){
	console.log(o)
}

function tableDefaultBegin(o){
	console.log(o)
}

function tableDefaultNext(o){
	console.log(o)
}

function tableDefaultEnd(o){
	console.log(o)
}

function _tableCall(_this,str,cb){
	var id = $(_this).attr("id");
	var index = str.indexOf("(");
	var funName = str.substr(0,index);
	if(index === -1){
		funName = str;
	}
	if(cb instanceof Function){
		eval(funName + "($(\"#" + id + "\"),cb)");
	}else{
		eval(funName + "($(\"#" + id + "\"))");
	}
}
