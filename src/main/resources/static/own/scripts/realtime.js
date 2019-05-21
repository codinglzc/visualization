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
            $("#RT_AppName").html(globalVars["app_name"]);
            $("#RT_Time").html(Global.formatTime(globalVars["time"] * 1000000));
            $("#RT_GlobalIns").html(Global.formatNum(globalVars["global_ins_cnt"]));
            $("#RT_DynReadIns").html(Global.formatNum(globalVars["dynamic_read_ins"]));
            $("#RT_DynWriteIns").html(Global.formatNum(globalVars["dynamic_write_ins"]));
            $("#RT_StaticReadIns").html(Global.formatNum(globalVars["static_read_ins"]));
            $("#RT_StaticWriteIns").html(Global.formatNum(globalVars["static_write_ins"]));
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
            'plugins': ["checkbox", "types", "search", "dnd"],
            // 'state': {"key": "demo2"},
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
                        startAddress: obj["startAddress"].slice(-7),
                        endAddress: obj["endAddress"].slice(-7),
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
                    var appName = $("#RT_AppName").html();
                    if (appName === "test") {
                        if (rowData.allocType === "Heap")
                            rowData.allocType = "DRAM";
                    }
                    else if (appName === "graph500") {
                        rowData.allocFunc = Global.getAllocFunction(obj["varName"].replace(/\s/ig, ''), obj["allocFuncName"], obj["sourceCodeInfo"]);
                        rowData.allocType = Global.getAllocType(obj["varName"].replace(/\s/ig, ''), obj["allocType"], obj["sourceCodeInfo"]);
                        // console.log(rowData);
                    }
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
            locale: "zh-CN",
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


    // ====================== memScatter1 3 ======================== //
    var memScatter;
    var memScatterOption;
    var displayKind = "size";

    var symbolSizeFunc = function (value) {
        //      0：x
        //      1：y
        //      2：objId
        //      3：read
        //      4：write
        //      5：read_in_cache
        //      6：strided_read
        //      7：pointerchasing_read
        //      8：random_read
        //      9：size
        //      10：maxDims
        var idx = 9;
        if (displayKind === "read")
            idx = 3;
        else if (displayKind === "write")
            idx = 4;
        var size = Math.log(value[idx]) * 50.0 / Math.log(value[10][displayKind]);
        return size < 10 ? 10 : size;
    };

    memScatterOption = {
        title: [{
            text: 'DRAM',
            x: '23%',
            y: 0
        }, {
            text: 'NVM',
            x: '72%',
            y: 0
        }],
        tooltip: {
            position: 'top',
            formatter: function (params, ticket, callback) {
                var objInfo = cur.masterlist[params.data[2]];
                var rs = [];
                rs.push("内存对象 ：" + objInfo.varName + " <br>");
                rs.push("地址空间 ：" + "[0x" + objInfo.startAddress + "-" + "0x" + objInfo.endAddress + "]" + " <br>");
                rs.push("大小     ：" + Global.formatSize(params.data[9]) + " <br>");
                rs.push("读指令数 ：" + params.data[3] + " <br>");
                rs.push("写指令数 ：" + params.data[4] + " <br>");
                return rs.join("");
            }
        },
        toolbox: {
            feature: {
                dataView: {show: true, readOnly: false},
                restore: {show: true},
                saveAsImage: {show: true}
            }
        },
        grid: [
            {
                x: '7%', y: '7%', width: '38%', height: '85%',
                show: true,
                borderWidth: 2,
                // backgroundColor: '#ccc',
            },
            {
                x2: '7%', y: '7%', width: '38%', height: '85%',
                show: true,
                borderWidth: 2,
                // backgroundColor: '#ccc',
            },
        ],
        xAxis: [
            {
                gridIndex: 0, min: -1, max: 11,
                interval: 1,
                splitArea: {show: true},// 显示分割区域
                splitLine: {show: false}, // 显示分割线
                axisLine: {show: false}, // 取消坐标轴线
                axisTick: {show: false}, // 取消坐标轴刻度
                axisLabel: {show: false}, // 是否显示坐标轴标签
            },
            {
                gridIndex: 1, min: -1, max: 11,
                interval: 1,
                splitArea: {show: true},// 显示分割区域
                splitLine: {show: false}, // 显示分割线
                axisLine: {show: false}, // 取消坐标轴线
                axisTick: {show: false}, // 取消坐标轴刻度
                axisLabel: {show: false}, // 是否显示坐标轴标签
            },
        ],
        yAxis: [
            {
                gridIndex: 0, min: -1, max: 11,
                interval: 1,
                splitArea: {show: true},// 显示分割区域
                splitLine: {show: false}, // 显示分割线
                axisLine: {show: false}, // 取消坐标轴线
                axisTick: {show: false}, // 取消坐标轴刻度
                axisLabel: {show: false}, // 是否显示坐标轴标签
            },
            {
                gridIndex: 1, min: -1, max: 11,
                interval: 1,
                splitArea: {show: true},// 显示分割区域
                splitLine: {show: false}, // 显示分割线
                axisLine: {show: false}, // 取消坐标轴线
                axisTick: {show: false}, // 取消坐标轴刻度
                axisLabel: {show: false}, // 是否显示坐标轴标签
            },
        ],
        series: [
            {
                name: 'DRAM',
                type: 'scatter',
                xAxisIndex: 0,
                yAxisIndex: 0,
                data: [],
                symbolSize: symbolSizeFunc,
            },
            {
                name: 'NVM',
                type: 'scatter',
                xAxisIndex: 1,
                yAxisIndex: 1,
                data: [],
                symbolSize: symbolSizeFunc,
            }
        ],
    };

    var _memScatterInit = function () {
        memScatter = echarts.init(document.getElementById('RT_MemScatter'), theme);
        memScatter.setOption(memScatterOption);

        // 添加 websocket onmessage 事件
        ws.addOnMsgListen("memScatter", function (event) {
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

            // 求出所有Dim的最大值
            var maxDims = {
                "read": 0,
                "write": 0,
                "read_in_cache": 0,
                "strided_read": 0,
                "pointerchasing_read": 0,
                "random_read": 0,
                "size": 0,
            };
            for (var objId in objs) {
                var objInfo = masterlist[objId];
                var accessVal = objs[objId];
                maxDims["read"] = accessVal["read"] > maxDims["read"] ? accessVal["read"] : maxDims["read"];
                maxDims["write"] = accessVal["write"] > maxDims["write"] ? accessVal["write"] : maxDims["write"];
                maxDims["read_in_cache"] = accessVal["read_in_cache"] > maxDims["read_in_cache"] ? accessVal["read_in_cache"] : maxDims["read_in_cache"];
                maxDims["strided_read"] = accessVal["strided_read"] > maxDims["strided_read"] ? accessVal["strided_read"] : maxDims["strided_read"];
                maxDims["pointerchasing_read"] = accessVal["pointerchasing_read"] > maxDims["pointerchasing_read"] ? accessVal["pointerchasing_read"] : maxDims["pointerchasing_read"];
                maxDims["random_read"] = accessVal["random_read"] > maxDims["random_read"] ? accessVal["random_read"] : maxDims["random_read"];
                maxDims["size"] = objInfo["size"] > maxDims["size"] ? objInfo["size"] : maxDims["size"];
            }

            // 计算DRAM和NVM两种内存对象的虚拟地址的最小值和最大值
            var dramMin = "", dramMax = "", nvmMin = "", nvmMax = "";
            for (var objId in objs) {
                var objInfo = masterlist[objId];
                var allocType = Global.getAllocType(objInfo["varName"].replace(/\s/ig, ''), objInfo["allocType"], objInfo["sourceCodeInfo"]);
                if (allocType === "NVM") {
                    if (nvmMin === "") {
                        nvmMin = objInfo["startAddress"];
                        nvmMax = objInfo["endAddress"];
                    } else {
                        nvmMin = parseInt(nvmMin, 16) < parseInt(objInfo["startAddress"], 16) ? nvmMin : objInfo["startAddress"];
                        nvmMax = parseInt(nvmMax, 16) > parseInt(objInfo["endAddress"], 16) ? nvmMax : objInfo["endAddress"];
                    }
                } else {
                    if (dramMin === "") {
                        dramMin = objInfo["startAddress"];
                        dramMax = objInfo["endAddress"];
                    } else {
                        dramMin = parseInt(dramMin, 16) < parseInt(objInfo["startAddress"], 16) ? dramMin : objInfo["startAddress"];
                        dramMax = parseInt(dramMax, 16) > parseInt(objInfo["endAddress"], 16) ? dramMax : objInfo["endAddress"];
                    }
                }
            }


            // 填充series数据
            var seriesDatas = [];
            seriesDatas.push([]);
            seriesDatas.push([]);
            for (var objId in objs) {
                var objInfo = masterlist[objId];
                // 计算axis索引
                var allocType = Global.getAllocType(objInfo["varName"].replace(/\s/ig, ''), objInfo["allocType"], objInfo["sourceCodeInfo"]);
                var idx = allocType === "NVM" ? 1 : 0;
                // 计算x，y坐标
                var addrNum = Math.log((parseInt(objInfo["startAddress"], 16) + parseInt(objInfo["endAddress"], 16)) / 2);
                var per = 0;
                if (allocType === "NVM") {
                    var nvmMaxNum = Math.log(parseInt(nvmMax, 16));
                    var nvmMinNum = Math.log(parseInt(nvmMin, 16));
                    per = (addrNum - nvmMinNum) * 100.0 / (nvmMaxNum - nvmMinNum);
                } else {
                    var dramMaxNum = Math.log(parseInt(dramMax, 16));
                    var dramMinNum = Math.log(parseInt(dramMin, 16));
                    per = (addrNum - dramMinNum) * 100.0 / (dramMaxNum - dramMinNum);
                }
                var oldPer = per;
                var x = 0, y = 9.5;
                while (per > 10) {
                    y = y - 1;
                    per = per - 10;
                }
                x = per;
                // 计算cell
                var accessVal = objs[objId];
                //      0：x
                //      1：y
                //      2：objId
                //      3：read
                //      4：write
                //      5：read_in_cache
                //      6：strided_read
                //      7：pointerchasing_read
                //      8：random_read
                //      9：size
                //      10：maxDims
                //      11：per
                var cell = [
                    x,
                    y,
                    accessVal["id"],
                    accessVal["read"],
                    accessVal["write"],
                    accessVal["read_in_cache"],
                    accessVal["strided_read"],
                    accessVal["pointerchasing_read"],
                    accessVal["random_read"],
                    objInfo["size"],
                    maxDims,
                    oldPer,
                ];
                seriesDatas[idx].push(cell);
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
            $.each(seriesDatas, function (idx, data) {
                // 按照per排序
                for (var i = data.length - 1; i > 0; i--) {
                    for (var j = 0; j < i; j++) {
                        if (data[j][11] > data[j + 1][11]) {
                            var temp = data[j];
                            data[j] = data[j + 1];
                            data[j + 1] = temp;
                        }
                    }
                }
                // 调整位置
                for (var i = 1; i < data.length; i++) {
                    while (data[i][11] < data[i - 1][11])
                        data[i][11]++;
                    if (data[i][11] - data[i - 1][11] < 1) {
                        data[i][11]++;
                    }
                }
                while (data.length > 0 && data[data.length - 1][11] > 100) {
                    data[data.length - 1][11]--;
                    for (var i = data.length - 2; i > 0; i--) {
                        while (data[i][11] > data[i + 1][11] ||
                        data[i + 1][11] - data[i][11] < 1) {
                            data[i][11]--;
                        }
                    }
                }
                // 重新计算x,y值
                for (var i = 0; i < data.length; i++) {
                    var per = data[i][11];
                    var x = 0, y = 9.5;
                    while (per > 10) {
                        y = y - 1;
                        per = per - 10;
                    }
                    x = per;
                    data[i][0] = x;
                    data[i][1] = y;
                }
                memScatterOption.series[idx].data = data;
            });
            // console.log(memScatterOption);
            memScatter.setOption(memScatterOption);
        });
        ws.flushOnMsgListenMap();

        // 绑定 RT_MemSelect 选定事件
        $('#RT_MemSelect').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
            displayKind = $("#RT_MemSelect").val();
            memScatter.setOption(memScatterOption);
        });

        // 绑定鼠标点击事件
        memScatter.on('click', function (params) {
            if (params.componentType === "series") {
                if (params.seriesType === "scatter") {
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

    var _memSelectInit = function () {
        // 加个颜色
        $("#RT_MemSelect").selectpicker({
            style: "btn-success",
        });
    };

    // 从 memHeatmap.on('click', function (params) {}); 中获得
    var memObjWRData = [];
    // Pie 的显示类型：R 或 RW
    var memObjPieKind = "R";

    /**
     * 渲染 memObj Read Pie
     * @param data  //      0：x
     //      1：y
     //      2：objId
     //      3：read
     //      4：write
     //      5：read_in_cache
     //      6：strided_read
     //      7：pointerchasing_read
     //      8：random_read
     //      9：size
     //      10：maxDims
     //      11：per
     * @private
     */
    var _renderOneMemObjReadPie = function (data) {
        var pieData = [];
        pieData.push({value: data[5], name: "读（缓存命中）"});
        pieData.push({value: data[6], name: "读（固定间隔读）"});
        pieData.push({value: data[7], name: "读（指针访问读）"});
        pieData.push({value: data[8], name: "读（随机读）"});

        var varName = cur.masterlist[data[2]].varName;

        var oneMemObjPie = echarts.getInstanceByDom(document.getElementById("RT_OneMemObjPie"));
        var option = oneMemObjPie.getOption();
        option.series[0].data = pieData;
        option.series[0].name = "read pie";
        option.title[0].text = varName;

        oneMemObjPie.setOption(option);

        $('#RT_OneMemObjShowRW_Btn').removeClass("active").removeAttr("disabled");
    };

    var _renderOneMemObjReadWritePie = function (data) {
        var pieData = [];
        pieData.push({value: data[3], name: "读"});
        pieData.push({value: data[4], name: "写"});

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

    // ---------------------------------- RT_TimelineChart init Begin ----------------------------------- //
    var timelineChartOption = {
        title: {
            top: '5%',
            text: '内存对象访存行为'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            },
            formatter: function (params) {
                var rs = [];
                rs.push("时间：" + Global.formatTime(params[0]['axisValue']*1000000) + "<br>");
                $.each(params, function (index, value) {
                    if (String(value['data'][1]).indexOf(".") > -1)
                        rs.push(value['seriesName'].split("#")[0] + "：" + value['data'][1].toFixed(2) + "%<br>");
                    else
                        rs.push(value['seriesName'].split("#")[0] + "：" + value['data'][1] + "<br>");
                });
                return rs.join("");
            }
        },
        legend: {
            type: 'scroll',
            top: '5%',
            left: '15%',
            right: '10%',
            textStyle: {
                fontSize: 15
            },
            data: []
        },
        grid: {
            top: '25%',
            left: '3%',
            right: '5%',
            bottom: '10%',
            containLabel: true,
            show: true,
            borderColor:"#ccc"
        },
        toolbox: {
            feature: {
                dataZoom: {
                    // yAxisIndex: 'none'
                },
                restore: {},
                saveAsImage: {}
            }
        },
        dataZoom: [
            {
                type: 'inside',
                startValue: 0,
                endValue: 30
            },
            {
                show: true,
                type: 'slider',
                bottom: '0%',
                startValue: 0,
                endValue: 30
            }
        ],
        xAxis: {
            type: 'value',
            name: '时间（秒）',
            nameTextStyle: {
                fontSize: 15
            },
            axisLine: {
                show: false,
            },
            axisTick: {
                show: false,
            },
            splitLine: {
                show: false,
            },
            splitArea: {
                show: false,
            },
        },
        yAxis: {
            type: 'value',
            name: '',
            nameTextStyle: {
                fontSize: 15
            },
            axisLine: {
                show: false,
            },
            axisTick: {
                show: false,
            },
            splitLine: {
                show: false,
            },
            splitArea: {
                show: false,
            },
        },
        series: []
    };

    var timelineChart;

    var memObjWithAggregateInfoMap = {};

    /**
     * 初始化 EChart
     */
    var lineInit = function () {
        timelineChart = echarts.init(document.getElementById('RT_TimelineChart'), theme);
        timelineChart.setOption(timelineChartOption);

        ws.addOnMsgListen("updateTimelineChart", function (event) {
            // 每个内存对象的访存信息
            var objs = [];
            // 汇总每个线程 TLS 的访存信息
            var json = eval("(" + event.data + ")");
            // 时间
            var time = json["global_vars"]["time"];
            if (time > 30) {
                $.each(timelineChartOption.dataZoom, function (idx, item) {
                    item.endValue = Math.ceil(time);
                    item.startValue = item.endValue - 30;
                })
            }
            var tls = json["TLS"];
            $.each(tls, function (index, item) {
                var accessedObjs = item["accessedObjs"];
                $.each(accessedObjs, function (index2, item2) {
                    if (objs.hasOwnProperty(item2["objId"])) {
                        var obj = objs[item2["objId"]];
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

            var kind = $("#RT_TypeSelect").val();
            // memObjWithAggregateInfoMap
            var memObjWithSingleAggregateInfoMap = [];
            for (var objId in objs) {
                var objInfo = masterlist[objId];
                var accessVal = objs[objId];
                var key = objInfo["varName"].replace(/\s/ig, '') + "#" + objId;
                var value = [];
                if (memObjWithAggregateInfoMap.hasOwnProperty(key)) {
                    value = memObjWithAggregateInfoMap[key];
                } else {
                    memObjWithAggregateInfoMap[key] = value;
                }
                var v = [];
                v["varName"] = objInfo["varName"].replace(/\s/ig, '');
                v["time"] = time;
                v["dynamicRead"] = accessVal["read"];
                v["dynamicWrite"] = accessVal["write"];
                v["readInCache"] = accessVal["read_in_cache"];
                v["stridedRead"] = accessVal["strided_read"];
                v["pointerRead"] = accessVal["pointerchasing_read"];
                v["randomRead"] = accessVal["random_read"];
                v["memRef"] = v["dynamicRead"] + v["dynamicWrite"];
                if (v['memRef'] !== 0) v["readWriteRatio"] = v["dynamicRead"] * 100.0 / v["memRef"];
                else v["readWriteRatio"] = 0;
                if (v["dynamicRead"] !== 0) v["readInCacheRatio"] = v["readInCache"] * 100.0 / v["dynamicRead"];
                else v["readInCacheRatio"] = 0;
                v["readNotInCache"] = v["dynamicRead"] - v["readInCache"];
                if (v["readNotInCache"] !== 0) {
                    v["stridedReadRatio"] = v["stridedRead"] * 100.0 / v["readNotInCache"];
                    v["randomReadRatio"] = v["randomRead"] * 100.0 / v["readNotInCache"];
                    v["pointerReadRatio"] = v["pointerRead"] * 100.0 / v["readNotInCache"];
                } else {
                    v["stridedReadRatio"] = 0;
                    v["randomReadRatio"] = 0;
                    v["pointerReadRatio"] = 0;
                }
                value.push(v);

                // 更新 timelineChartOption
                var line;
                if (timelineChartOption.legend.data.indexOf(key) === -1) {
                    timelineChartOption.legend.data.push(key);
                    line = {};
                    line["name"] = key;
                    line["type"] = "line";
                    line["data"] = [];
                    // line["showSymbol"] = false;
                    line["hoverAnimation"] = false;
                    line["smooth"] = true;
                    line["lineStyle"] = {normal: {opacity: 0.5}};
                    line["data"].push([v["time"], v[kind]]);
                    timelineChartOption.series.push(line);
                } else {
                    for (var i = 0; i < timelineChartOption.series.length; i++) {
                        if (timelineChartOption.series[i]["name"] === key) {
                            line = timelineChartOption.series[i];
                            break;
                        }
                    }
                    line["data"].push([v["time"], v[kind]]);
                }
                if (kind.indexOf("Ratio") !== -1) {
                    timelineChartOption.yAxis.name = "百分比（%）";
                } else {
                    timelineChartOption.yAxis.name = "数量（个）";
                }
            }
            // console.log(timelineChartOption);
            timelineChart.setOption(timelineChartOption);
        });
        ws.flushOnMsgListenMap();
    };
    // ---------------------------------- RT_TimelineChart init End ----------------------------------- //

    // ---------------------------------- RT_TypeSelect init Begin ----------------------------------- //
    var typeSelectInit = function () {
        // 初始化 EXP_TypeSelect
        $("#RT_TypeSelect").selectpicker();
        $('#RT_TypeSelect').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
            renderTimelineChar();
        });
    };

    // 重新渲染TimelineChar
    var renderTimelineChar = function () {
        var kind = $("#RT_TypeSelect").val();
        timelineChart.clear();
        var legendData = [];
        var series = [];
        $.each(memObjWithAggregateInfoMap, function (key, value) {
            legendData.push(key);
            var line = {};
            line["name"] = key;
            line["type"] = "line";
            line["data"] = [];
            // line["showSymbol"] = false;
            line["hoverAnimation"] = false;
            line["smooth"] = true;
            line["lineStyle"] = {normal: {opacity: 0.5}};
            $.each(value, function (i, objNode) {
                var pArr = [(objNode["time"]), objNode[kind]];
                line["data"].push(pArr);
            });
            series.push(line);
        });
        timelineChartOption.legend.data = legendData;
        timelineChartOption.series = series;
        if (kind.indexOf("Ratio") !== -1) {
            timelineChartOption.yAxis.name = "百分比（%）";
        } else {
            timelineChartOption.yAxis.name = "数量（个）";
        }
        // console.log(timelineChartOption);
        timelineChart.setOption(timelineChartOption);
    };
    // ---------------------------------- RT_TypeSelect init End ----------------------------------- //

    return {
        init: function () {
            _websocketInit();
            _memTreeInit();
            _memTableInit();

            _memSelectInit();
            _memScatterInit();
            _oneMemObjBtnInit();
            _oneMemObjPieInit();

            lineInit();
            typeSelectInit();
        }
    }
}();

jQuery(document).ready(function () {
    Realtime.init(); // init metronic core componets
});