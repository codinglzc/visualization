/**
 * <p>
 * Realtime
 * </p>
 *
 * @author Liu Cong
 * @since 2018/12/5
 */
var Realtime = function () {

    // 保存 ws 传来的 json
    var arr = [];
    var cur = [];
    // 缓存表格里面的 ObjIds
    var memTableObjIds = [];

    // ====================== Web Socket ======================== //
    // websocket 对象
    var ws = Websocket;

    // echarts theme
    var theme = "macarons";

    /**
     * WS 初始化
     * @private
     */
    var _websocketInit = function () {
        // ====================== 添加触发事件 ======================== //
        // 添加 onopen 事件，修改 #RT_Note, #RT_WsStatus 状态栏
        ws.addOnOpenListen("RT_WsStatus", function (event) {
            $("#RT_Note").removeClass().addClass("note note-info");
            $("#RT_WsStatus").removeClass().addClass("label label-success").html("Successed: WebSocket 连接成功");
        });
        // 添加 onerror 事件，修改 #RT_Note, #RT_WsStatus 状态栏
        ws.addOnErrorListen("RT_WsStatus", function (event) {
            $("#RT_Note").removeClass().addClass("note note-danger");
            $("#RT_WsStatus").removeClass().addClass("label label-danger").html("Failed: WebSocket 连接失败");
        });
        // 添加 onmessage 事件，1)将数据缓存到 arr 中， 2)跟新全局变量
        ws.addOnMsgListen("saveToData", function (event) {
            // 将数据转成json对象
            var json = eval("(" + event.data + ")");
            // 将数据缓存到 data 中，跟新 cur 变量
            arr.push(json);
            cur = json;
            // 跟新全局变量
            var globalVars = json["global_vars"];
            $("#RT_Time").html(globalVars["time"]);
            $("#RT_GlobalIns").html(globalVars["global_ins_cnt"]);
            $("#RT_DynReadIns").html(globalVars["dynamic_read_ins"]);
            $("#RT_DynWriteIns").html(globalVars["dynamic_write_ins"]);
            $("#RT_StaticReadIns").html(globalVars["static_read_ins"]);
            $("#RT_StaticWriteIns").html(globalVars["static_write_ins"]);
        });
        // ====================== 添加触发事件 ======================== //
        // 在 websocket 连接之前，渲染 #RT_Note, #RT_WsStatus 状态栏
        $("#RT_WsStatus").removeClass().addClass("label label-info").html("Info: WebSocket 正在连接...");
        ws.init();
    };
    // ====================== Web Socket ======================== //


    // ====================== jsTree ======================== //
    /**
     * 内存对象 Tree 结构 init
     * @private
     * @example https://www.jstree.com/api/
     */
    var _memTreeInit = function () {
        var $tree = $('#RT_MemTree');
        $tree.jstree({
            'plugins': ["checkbox", "types", "search", "state", "dnd"],
            'state': {"key": "demo2"},
            "types": {
                "default": {
                    "icon": "fa fa-folder icon-state-warning icon-lg"
                },
                "file": {
                    "icon": "fa fa-file icon-state-warning icon-lg"
                }
            },
            // 这两个必须要
            "checkbox": {
                "tie_selection": false,
                // "whole_node": false
            },
            "search": {
                "search_leaves_only": true,
            },
            'core': {
                // so that create works
                "check_callback": true,
                "animation": 0,
                "themes": {
                    "responsive": false
                },
                'data': [
                    {
                        "id": "RT_Tree_Inactive",
                        "text": "Inactive Memory Object",
                        "icon": "fa fa-hourglass-end",
                    },
                    {
                        "id": "RT_Tree_Active",
                        "text": "Active Memory Object",
                        "icon": "fa fa-hourglass-half",
                        "state": {"opened": true},
                    }

                ],
                "error": function (msg) {
                    console.log(msg);
                },
            }
        });

        // 搜索框
        var to = false;
        $('#RT_MemTree_Search').keyup(function () {
            if (to) {
                clearTimeout(to);
            }
            to = setTimeout(function () {
                var v = $('#RT_MemTree_Search').val();
                $tree.jstree(true).search(v);
                $('#RT_Tree_Inactive li').hide();
                $('#RT_Tree_Active li').hide();
                $('a.jstree-search').parent('li').show();
                var instance = $tree.jstree(true);
                if (v === "") {
                    instance.show_all();
                }
            }, 250);
        });

        // 当 Tree 加载完毕之后触发
        $tree.on("ready.jstree", function (e, data) {
            // 禁用 Master/Active parent Node 的复选框
            // $('#RT_MemTree').jstree(true).disable_checkbox(["RT_Tree_Inactive", "RT_Tree_Active"]);
            // 添加 ws onmessage 回调
            ws.addOnMsgListen("updateMemTree", function (event) {
                // 将数据转成json对象
                var json = eval("(" + event.data + ")");
                var masterList = json["masterlist"];
                var activeList = json["activelist"];

                var instance = data.instance;
                // update master 和 active 节点
                $.each(masterList, function (index, item) {
                    // 判断对象是否是 active
                    var isActive = false;
                    $.each(activeList, function (i, objId) {
                        if (item["objId"] === objId) {
                            isActive = true;
                            return false;
                        }
                    });
                    // update active node
                    var nodeActiveId = "RT_Active_" + item["objId"];
                    if (isActive) {
                        if (!instance.get_node(nodeActiveId, false)) {
                            instance.create_node("RT_Tree_Active", {
                                "id": nodeActiveId,
                                "text": item["varName"],
                                "data": {"id": item["objId"], "status": "active"},
                                "icon": "fa fa-circle"
                            });
                        }
                    } else {
                        instance.delete_node(nodeActiveId);
                        // update master node
                        var nodeMasterId = "RT_Master_" + item["objId"];
                        if (!instance.get_node(nodeMasterId, false)) {
                            instance.create_node("RT_Tree_Inactive", {
                                "id": nodeMasterId,
                                "text": item["varName"],
                                "data": {"id": item["objId"], "status": "inactive"},
                                "icon": "fa fa-circle"
                            });
                        }
                    }
                });
            });
            ws.flushOnMsgListenMap();
        });

        // 当一个节点被 check 之后触发
        $tree.on("check_node.jstree", function (e, data) {
            var instance = data.instance;
            var rowDatas = [];
            var objDomIds = [];

            if (data.node.data === null) {
                // 处理 Master/Active Memory Object 节点的 check
                objDomIds = data.node.children;
            } else {
                // 处理 单个的 check 节点
                objDomIds.push(data.node.id);
            }
            $.each(objDomIds, function (index, domId) {
                var node = instance.get_node(domId, false);
                var objId = node.data.id;
                // 如果表格里没有就添加
                if (memTableObjIds.indexOf(objId) < 0) {
                    memTableObjIds.push(objId);  // 跟新 memTableObjIds
                    var obj = cur["masterlist"][objId];
                    var rowData = {
                        id: obj["objId"],
                        varName: obj["varName"],
                        startAddress: obj["startAddress"],
                        endAddress: obj["endAddress"],
                        size: obj["size"],
                        creatorThreadId: obj["creatorThreadId"],
                        ip: obj["ip"],
                        sourceCodeInfo: obj["sourceCodeInfo"],
                        allocFunc: obj["allocFuncName"],
                        allocType: obj["allocType"],
                        startTime: obj["startTime"],
                        endTime: obj["endTime"],
                        startInstruction: obj["startInstruction"],
                        endInstruction: obj["endInstruction"],
                        startMemoryInstruction: obj["startMemoryInstruction"],
                        endMemoryInstruction: obj["endMemoryInstruction"],
                        status: node.data.status
                    };
                    rowDatas.push(rowData);
                }
            });
            _memTablePrepend(rowDatas);
        });

        // 当一个节点被 uncheck 之后触发
        $tree.on("uncheck_node.jstree", function (e, data) {
            var instance = data.instance;
            var objDomIds = [];
            if (data.node.data === null) {
                // 处理 Master/Active Memory Object 节点的 check
                objDomIds = data.node.children;
            } else {
                // 处理 单个的 check 节点
                objDomIds.push(data.node.id);
            }
            var objIds = [];
            $.each(objDomIds, function (index, domId) {
                var node = instance.get_node(domId, false);
                var objId = node.data.id;
                // 跟新 memTableObjIds
                var i = memTableObjIds.indexOf(node.data.id);
                if (i >= 0) {
                    memTableObjIds.splice(i, 1);
                    objIds.push(objId);
                }
            });
            _memTableRemove({"field": "id", "values": objIds});
        });
    };
    // ====================== jsTree ======================== //

    // ====================== Memory Table ======================== //
    // looking for http://bootstrap-table.wenzhixin.net.cn/zh-cn/documentation/
    /**
     * Master Table init
     * @private
     */
    var _memTableInit = function () {
        var table = $("#RT_MemTable");
        table.bootstrapTable({
            columns: [
                {
                    field: "id",
                    title: "Id",
                    visible: false,
                    sortable: true,
                    halign: "right",
                    align: "right"
                }, {
                    field: "varName",
                    title: "Name",
                    sortable: true
                }, {
                    field: "startAddress",
                    title: "Start Address",
                    sortable: true,
                    halign: "right",
                    align: "right"
                }, {
                    field: "endAddress",
                    title: "End Address",
                    sortable: true,
                    halign: "right",
                    align: "right"
                }, {
                    field: "size",
                    title: "Size",
                    sortable: true,
                    halign: "right",
                    align: "right"
                }, {
                    field: "creatorThreadId",
                    title: "Created Thread Id",
                    visible: false,
                    sortable: true,
                    halign: "right",
                    align: "right"
                }, {
                    field: "ip",
                    title: "IP",
                    visible: false,
                    halign: "right",
                    align: "right"
                }, {
                    field: "sourceCodeInfo",
                    title: "Source Code Info"
                }, {
                    field: "allocType",
                    title: "Alloc Type",
                    sortable: true
                }, {
                    field: "allocFunc",
                    title: "Alloc Func",
                    sortable: true
                }, {
                    field: "startTime",
                    title: "Start Time",
                    sortable: true,
                    halign: "right",
                    align: "right"
                }, {
                    field: "endTime",
                    title: "End Time",
                    sortable: true,
                    halign: "right",
                    align: "right"
                }, {
                    field: "startInstruction",
                    title: "Start Instruction",
                    visible: false,
                    sortable: true,
                    halign: "right",
                    align: "right"
                }, {
                    field: "endInstruction",
                    title: "End Instruction",
                    visible: false,
                    sortable: true,
                    halign: "right",
                    align: "right"
                }, {
                    field: "startMemoryInstruction",
                    title: "Start Memory Instruction",
                    visible: false,
                    sortable: true,
                    halign: "right",
                    align: "right"
                }, {
                    field: "endMemoryInstruction",
                    title: "End Memory Instruction",
                    visible: false,
                    sortable: true,
                    halign: "right",
                    align: "right"
                }, {
                    field: "status",
                    title: "status"
                }
            ],
            data: [
                // {
                //     id: 1,
                //     varName: "varName",
                //     startAddress: "startAddress",
                //     endAddress: "endAddress",
                //     size: "size",
                //     creatorThreadId: "creatorThreadId",
                //     ip: "ip",
                //     sourceCodeInfo: "sourceCodeInfo",
                //     allocFunc: "allocFunc",
                //     allocType: "allocType",
                //     startTime: "startTime",
                //     endTime: "endTime",
                //     startInstruction: "startInstruction",
                //     endInstruction: "endInstruction",
                //     startMemoryInstruction: "startMemoryInstruction",
                //     endMemoryInstruction: "endMemoryInstruction",
                //     status: "status",
                // },
            ],
            showColumns: true,
            height: 400,
            sortName: "varName",
            search: true,
            striped: true,
            pagination: true,
            pageSize: 10,
            pageList: [5, 10, 25, 50, 100, "ALL"],
            showToggle: true,
            detailView: true,
            uniqueId: "id",
            detailFormatter: function (index, row) {
                var html = [];
                $.each(row, function (key, value) {
                    html.push('<p><b>' + key + ':</b> ' + value + '</p>');
                });
                return html.join('');
            }
        });
    };

    /**
     * 加载数据到表格中，旧数据会被替换。
     * @param data 该参数应该与上面中的例子具有相同的格式
     * @private
     * @example http://issues.wenzhixin.net.cn/bootstrap-table/#methods/load.html
     */
    var _memTableLoad = function (data) {
        $("#RT_MemTable").bootstrapTable('load', data);
    };

    /**
     * 添加数据到表格在现有数据之后。
     * @param data 该参数应该与上面中的例子具有相同的格式
     * @private
     * @example http://issues.wenzhixin.net.cn/bootstrap-table/#methods/append.html
     */
    var _memTableAppend = function (data) {
        $("#RT_MemTable").bootstrapTable('append', data);
    };

    /**
     * 添加数据到表格在现有数据之前。
     * @param data 该参数应该与上面中的例子具有相同的格式
     * @private
     * @example http://issues.wenzhixin.net.cn/bootstrap-table/#methods/prepend.html
     */
    var _memTablePrepend = function (data) {
        $("#RT_MemTable").bootstrapTable('prepend', data);
    };

    /**
     * 插入新行，参数包括：
     * index: 要插入的行的 index，
     * row: 行的数据，Object 对象。
     * @param params
     * @private
     * @example http://issues.wenzhixin.net.cn/bootstrap-table/#methods/insertRow.html
     */
    var _memTableInsertRow = function (params) {
        $("#RT_MemTable").bootstrapTable('insertRow', params);
    };

    /**
     * 从表格中删除数据，包括两个参数： field: 需要删除的行的 field 名称，
     * values: 需要删除的行的值，类型为数组。
     * @param params
     * @private
     * @example http://issues.wenzhixin.net.cn/bootstrap-table/#methods/remove.html
     */
    var _memTableRemove = function (params) {
        $("#RT_MemTable").bootstrapTable('remove', params);
    };

    /**
     * 删除表格所有数据
     * @private
     * @example http://issues.wenzhixin.net.cn/bootstrap-table/#methods/removeAll.html
     */
    var _memTableRemoveAll = function () {
        $("#RT_MemTable").bootstrapTable('removeAll');
    };

    /**
     * 更新指定的行，参数包括：
     * index: 要更新的行的 index，
     * row: 行的数据，Object 对象。
     * @param params
     * @private
     * @example http://issues.wenzhixin.net.cn/bootstrap-table/#methods/updateRow.html
     */
    var _memTableUpdateRow = function (params) {
        $("#RT_MemTable").bootstrapTable('updateRow', params);
    };
    // ====================== MasterTable ======================== //

    // ====================== Memory Object Select ======================== //
    var _memSelectInit = function () {
        // 加个颜色
        $("#RT_MemSelect").selectpicker({
            style: "btn-success",
        });
    };
    // ====================== Memory Object Select ======================== //

    // ====================== Memory Object HeatMap ======================== //
    var _memHeatmapInit = function () {
        // x 轴和 y 轴的长度
        var numOfX = 30;
        var numOfY = 6;
        // 记录 cell 是否已经被占用
        var isHold = _createTwoDimensionArray(numOfX, numOfY);
        // 记录已经出现的内存对象的位置（key：objId，value：[x, y]）
        var objPos = [];

        // heatmap 所需变量
        var memHeatmap = echarts.init(document.getElementById("RT_MemHeatmap"), theme);

        var title = "内存对象热力图";
        var xData = [];
        for (var i = 0; i < numOfX; i++) {
            xData.push("");
        }
        var yData = [];
        for (var i = 0; i < numOfY; i++) {
            yData.push("");
        }

        var heapmapData = [];

        var visualMapMax = 10;

        var option = {
            // 标题
            title: {
                text: title,
                x: 'center',
                y: 0
            },
            // 悬浮提示框组件
            tooltip: {
                position: 'top'
            },
            animation: false,
            // 直角坐标系内绘图网格，单个 grid 内最多可以放置上下两个 X 轴，左右两个 Y 轴。
            grid: {
                height: '50%' // grid 组件的高度
            },
            // 右上角的工具组件
            toolbox: {
                feature: {
                    dataView: {show: true, readOnly: false},
                    restore: {show: true},
                    saveAsImage: {show: true}
                }
            },
            // 直角坐标系 grid 中的 x 轴
            xAxis: {
                type: 'category',
                data: xData,
                splitArea: {show: true},// 显示分割区域
                splitLine: {show: false}, // 显示分割线
                axisLine: {show: false}, // 取消坐标轴线
                axisTick: {show: false} // 取消坐标轴刻度
            },
            // 直角坐标系 grid 中的 y 轴
            yAxis: {
                type: 'category',
                data: yData,
                splitArea: {show: true},// 显示分割区域
                splitLine: {show: false}, // 显示分割线
                axisLine: {show: false}, // 取消坐标轴线
                axisTick: {show: false} // 取消坐标轴刻度
            },
            // 连续型视觉映射组件
            visualMap: {
                min: 0,
                max: visualMapMax,
                calculable: true,
                orient: 'horizontal',
                left: 'center',
                bottom: '15%',
                /**
                 * 指定用数据的『哪个维度』，映射到视觉元素上。默认取 data 中的最后一个维度。
                 * 0：x
                 * 1：y
                 * 2：objId
                 * 3：read
                 * 4：write"
                 * 5：read_in_cache
                 * 6：strided_read
                 * 7：pointerchasing_read
                 * 8：random_read
                 */
                dimension: 3,
                // 修改样式颜色
                inRange: {
                    color: ['#ffe9a5', '#ffb243', 'red'],
                    symbolSize: [30, 100]
                }
            },
            // 系列列表。每个系列通过 type 决定自己的图表类型
            series: [{
                name: 'read',
                type: 'heatmap', // 热力图，必须配合 visualMap 组件使用。
                data: heapmapData,
                label: {// cell 上面的数字
                    show: true,
                    formatter: function (params) {
                        // 自定义cell上显示的文本
                        return params.data[3];
                    }
                },
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10, // 图形阴影的模糊大小
                        shadowColor: 'rgba(0, 0, 0, 0.5)', // 阴影颜色
                    }
                },
                tooltip: { // 自定义悬浮提示框内容
                    formatter: function (params, ticket, callback) {
                        return "<b>" + params.data[9] + "</b>" + "<br>read<br>" + params.data[3];
                    }
                }
            }]
        };

        memHeatmap.setOption(option);

        // 添加 websocket onmessage 事件
        ws.addOnMsgListen("heatmap", function (event) {
            // 每个内存对象的访存信息
            var objs = [];
            // 汇总每个线程 TLS 的访存信息
            var json = eval("(" + event.data + ")");
            var tls = json["TLS"];
            $.each(tls, function (index, item) {
                var accessedObjs = item["accessedObjs"];
                $.each(accessedObjs, function (index2, item2) {
                    if (objs.hasOwnProperty(item2["objId"])) {
                        var obj = objs[item2["objId"]];
                        obj["id"] += item2["objId"];
                        obj["read"] += item2["dynamic_read"];
                        obj["write"] += item2["dynamic_write"];
                        obj["read_in_cache"] += item2["read_in_cache"];
                        obj["strided_read"] += item2["strided_read"];
                        obj["pointerchasing_read"] += item2["pointerchasing_read"];
                        obj["random_read"] += item2["random_read"];
                    } else {
                        objs[item2["objId"]] = {};
                        var obj = objs[item2["objId"]];
                        obj["id"] = item2["objId"];
                        obj["read"] = item2["dynamic_read"];
                        obj["write"] = item2["dynamic_write"];
                        obj["read_in_cache"] = item2["read_in_cache"];
                        obj["strided_read"] = item2["strided_read"];
                        obj["pointerchasing_read"] = item2["pointerchasing_read"];
                        obj["random_read"] = item2["random_read"];
                    }
                });
            });
            // 或者从 json["masterlist"][index]["accessList"] 中取值
            var masterlist = json["masterlist"];
            $.each(masterlist, function (index, item) {
                if (item["accessList"].length <= 0)
                    return true;
                var accessList = item["accessList"];
                $.each(accessList, function (index2, item2) {
                    if (objs.hasOwnProperty(item["objId"])) {
                        var obj = objs[item["objId"]];
                        obj["id"] += item["objId"];
                        obj["read"] += item2["dynamicRead"];
                        obj["write"] += item2["dynamicWrite"];
                        obj["read_in_cache"] += item2["readInCache"];
                        obj["strided_read"] += item2["stridedRead"];
                        obj["pointerchasing_read"] += item2["pointerChasingRead"];
                        obj["random_read"] += item2["randomRead"];
                    } else {
                        objs[item["objId"]] = {};
                        var obj = objs[item["objId"]];
                        obj["id"] = item["objId"];
                        obj["read"] = item2["dynamicRead"];
                        obj["write"] = item2["dynamicWrite"];
                        obj["read_in_cache"] = item2["readInCache"];
                        obj["strided_read"] = item2["stridedRead"];
                        obj["pointerchasing_read"] = item2["pointerChasingRead"];
                        obj["random_read"] = item2["randomRead"];
                    }
                })
            });
            // 修改 heapmapData
            heapmapData = []; // 先清空
            for (var objId in objs) {
                var obj = objs[objId];
                var cell = _getCell(objId);
                cell.push(obj["id"]);
                cell.push(obj["read"]);
                cell.push(obj["write"]);
                cell.push(obj["read_in_cache"]);
                cell.push(obj["strided_read"]);
                cell.push(obj["pointerchasing_read"]);
                cell.push(obj["random_read"]);
                heapmapData.push(cell);
                visualMapMax = Math.max(visualMapMax, obj["read"], obj["write"]);
                // 跟新 memObjWRData 并刷新 Pie
                if (cell[2] === memObjWRData[2]) {
                    memObjWRData = cell;
                    if (memObjPieKind === "R") {
                        _renderOneMemObjReadPie(memObjWRData);
                    } else {
                        _renderOneMemObjReadWritePie(memObjWRData);
                    }
                }
            }
            // 刷新 heapmap
            option.series[0].data = heapmapData;
            option.visualMap.max = visualMapMax;
            memHeatmap.setOption(option);
        });
        ws.flushOnMsgListenMap();

        /**
         * 返回一个未使用的 cell
         * @param objId 内存对象id
         * @returns {Array}
         * @private
         */
        var _getCell = function (objId) {
            var cell = [];
            if (objPos.hasOwnProperty(objId)) {
                cell.push(objPos[objId][0]);
                cell.push(objPos[objId][1]);
            } else {
                var x, y;
                do {
                    x = Math.floor(Math.random() * numOfX);
                    y = Math.floor(Math.random() * numOfY);
                } while (isHold[x][y] !== -1);
                isHold[x][y] = objId;
                cell.push(x);
                cell.push(y);
                var objP = [];
                objP.push(x);
                objP.push(y);
                objPos[objId] = objP;
            }
            return cell;
        };

        // 绑定 RT_MemSelect 选定事件
        $('#RT_MemSelect').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
            var dim = $("#RT_MemSelect").val(); // 维度
            var text = $("#RT_MemSelect").find("option:selected").text();
            option.visualMap.dimension = dim;
            option.series[0].name = text;
            option.series[0].label.formatter = function (params) {
                return params.data[dim];
            };
            option.series[0].tooltip.formatter = function (params, ticket, callback) {
                return text + "<br>" + params.data[dim];
            };
            memHeatmap.setOption(option);
        });

        // 绑定鼠标点击事件
        memHeatmap.on('click', function (params) {
            if (params.componentType === "series") {
                if (params.seriesType === "heatmap") {
                    // 当点击 cell 时，显示该内存对象的 Pie 图
                    var data = params.data;
                    memObjWRData = data;

                    if (memObjPieKind === "R") {
                        _renderOneMemObjReadPie(data);
                    } else {
                        _renderOneMemObjReadWritePie(data);
                    }
                }
            }
        });
    };
    // ====================== Memory Object HeatMap ======================== //

    // 从 memHeatmap.on('click', function (params) {}); 中获得
    var memObjWRData = [];
    // Pie 的显示类型：R 或 RW
    var memObjPieKind = "R";

    /**
     * 渲染 memObj Read Pie
     * @param data  0：x
     *              1：y
     *              2：objId
     *              3：read
     *              4：write"
     *              5：read_in_cache
     *              6：strided_read
     *              7：pointerchasing_read
     *              8：random_read
     * @private
     */
    var _renderOneMemObjReadPie = function (data) {
        var pieData = [];
        pieData.push({value: data[5], name: "read in cache"});
        pieData.push({value: data[6], name: "strided read"});
        pieData.push({value: data[7], name: "pointer read"});
        pieData.push({value: data[8], name: "random read"});

        var varName = cur.masterlist[data[2]].varName;

        var oneMemObjPie = echarts.getInstanceByDom(document.getElementById("RT_OneMemObjPie"));
        var option = oneMemObjPie.getOption();
        option.series[0].data = pieData;
        option.series[0].name = "read pie";
        option.title[0].text = varName;

        oneMemObjPie.setOption(option);

        $('#RT_OneMemObjShowRW_Btn').removeClass("active").removeAttr("disabled");
    };

    /**
     * 渲染 memObj Read/Write Pie
     * @param data  0：x
     *              1：y
     *              2：objId
     *              3：read
     *              4：write"
     *              5：read_in_cache
     *              6：strided_read
     *              7：pointerchasing_read
     *              8：random_read
     * @private
     */
    var _renderOneMemObjReadWritePie = function (data) {
        var pieData = [];
        pieData.push({value: data[3], name: "read"});
        pieData.push({value: data[4], name: "write"});

        var varName = cur.masterlist[data[2]].varName;

        var oneMemObjPie = echarts.getInstanceByDom(document.getElementById("RT_OneMemObjPie"));
        var option = oneMemObjPie.getOption();
        option.series[0].data = pieData;
        option.series[0].name = "read/write pie";
        option.title[0].text = varName;

        oneMemObjPie.setOption(option);

        $('#RT_OneMemObjShowR_Btn').removeClass("active").removeAttr("disabled");
    };

    // ====================== One Memory Object Btn ======================== //
    var _oneMemObjBtnInit = function () {
        var showRBtn = $('#RT_OneMemObjShowR_Btn');
        var showRWBtn = $('#RT_OneMemObjShowRW_Btn');
        showRBtn.attr({disabled: "disabled"});
        showRWBtn.attr({disabled: "disabled"});
        showRBtn.on("click", function () {
            _renderOneMemObjReadPie(memObjWRData);
            $(this).addClass("active").attr({disabled: "disabled"});
            memObjPieKind = "R";
        });
        showRWBtn.on("click", function () {
            _renderOneMemObjReadWritePie(memObjWRData);
            $(this).addClass("active").attr({disabled: "disabled"});
            memObjPieKind = "RW";
        });
    };
    // ====================== One Memory Object Btn ======================== //

    // ====================== One Memory Object Read Sector ======================== //
    var _oneMemObjPieInit = function () {
        var oneMemObjPie = echarts.init(document.getElementById("RT_OneMemObjPie"), theme);
        var option = {
            title: {
                text: "",
                left: '0%',
                top: '10%'
            },
            tooltip: {
                trigger: "item",
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                // orient: 'vertical',
                bottom: '10%',
                left: 'center'
            },
            toolbox: {
                show: true,
                feature: {
                    dataView: {readOnly: false},
                    // magicType: {type: ['pie', 'bar']},
                    restore: {},
                    saveAsImage: {}
                }
            },
            series: [
                {
                    name: "",
                    type: "pie",
                    radius: "50%", // 饼图的半径
                    center: ["50%", "50%"], // 饼图的中心（圆心）坐标
                    data: [],
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
        oneMemObjPie.setOption(option);
    };
    // ====================== One Memory Object Read Sector ======================== //

    /**
     * 生成一个初始值为 -1 的二维数组
     * @param x 一维数
     * @param y 二维数
     * @returns {Array[][]}
     * @private
     */
    var _createTwoDimensionArray = function (x, y) {
        var rs = [];
        for (var i = 0; i < x; i++) {
            rs[i] = [];
            for (var j = 0; j < y; j++) {
                rs[i][j] = -1;
            }
        }
        return rs;
    };

    return {
        init: function () {
            _websocketInit();
            _memTreeInit();
            _memTableInit();
            _memSelectInit();
            _memHeatmapInit();
            _oneMemObjBtnInit();
            _oneMemObjPieInit();
        }
    }
}();

jQuery(document).ready(function () {
    Realtime.init(); // init metronic core componets
});