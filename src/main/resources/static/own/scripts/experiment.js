/**
 * <p>
 * Experiment
 * </p>
 *
 * @author Liu Cong
 * @since 2019/1/8
 */
var Experiment = function () {

    // echarts theme
    var theme = "macarons";

    // ---------------------------------- Exps Table Modal Begin ----------------------------------- //
    var operateFormatterFunc = function (value, row, index, field) {
        return [
            '<a class="edit" title="Edit" ' +
            'data-toggle="modal" data-target="#EXP_EditExpModal">',
            '<i class="glyphicon glyphicon-edit"></i>',
            '</a>',
            '<a class="remove" href="javascript:void(0)" title="Remove" >',
            '<i class="glyphicon glyphicon-remove"></i>',
            '</a>',
        ].join("");
    };

    var operateEvents = {
        'click .edit': function (e, value, row, index) {
            $("#EXP_EditExpModal input").removeAttr("readonly");
            $("#EXP_EditExpModal [name=id]").val(row["id"]);
            $("#EXP_EditExpModal [name=create_time]").val(row["createTime"]);
            $("#EXP_EditExpModal [name=consume_time]").val(row["consumeTime"]);
            $("#EXP_EditExpModal [name=description]").val(row["description"]);
            $("#EXP_EditExpModal input").attr("readonly", "readonly");
        },
        'click .remove': function (e, value, row, index) {
            $.ajax({
                url: "exp/delete",
                data: {
                    id: row.id,
                },
                type: "POST",
                dataType: "json",
                success: function (result) {
                    if (!Global.checkServerMsg(result)) return;
                    // 刷新 EXP_ChooseExpModal 的表格
                    refreshTable($("#EXP_ExpsTable"));
                }
            });
        }
    };

    var columns = [
        {
            field: "state",
            radio: true,
            align: "center",
        },
        {
            field: "id",
            title: "Id",
            visible: false,
            sortable: true,
            halign: "center",
            align: "right",
            width: "50px",
        }, {
            field: "createTime",
            title: "Create time",
            visible: true,
            sortable: true,
            halign: "center",
            align: "right",
            width: "160px",
        }, {
            field: "consumeTime",
            title: "Consume time",
            visible: true,
            sortable: true,
            halign: "center",
            align: "right",
            width: "100px",
            formatter: function (value, row, index, field) {
                return Global.formatTime(value);
            }
        }, {
            field: "description",
            title: "Description",
            visible: true,
            sortable: false,
            halign: "center",
            align: "right",
        }, {
            field: "numOfObjs",
            title: "The number of Objects",
            visible: false,
            sortable: false,
            halign: "center",
            align: "right",
            width: "100px",
        }, {
            field: "numOfTimeNodes",
            title: "The number of time nodes",
            visible: false,
            sortable: false,
            halign: "center",
            align: "right",
            width: "100px",
        }, {
            field: "operate",
            title: "Operate",
            halign: "center",
            align: "center",
            width: "50px",
            formatter: operateFormatterFunc,
            events: operateEvents,
        },
    ];

    // 向后台传的参数
    var queryParamsFunc = function (params) { //向后台传的参数
        return {
            pageNum: params.offset / params.limit,
            pageSize: params.limit,
            sort: params.sort,
            order: params.order,
            // search: params.search,
        };
    };

    // 修改返回的数据格式
    var responseHandlerFun = function (json) {
        if (!Global.checkServerMsg(json)) {
            alert("获取 exps 数据失败！");
            return;
        }
        var size = json["extend"]["pageInfo"]["size"];
        var content = json["extend"]["pageInfo"]["content"];
        return {
            total: size,
            rows: content,
        };
    };

    var expsTableOptions = {
        columns: columns,
        data: [],
        showColumns: true,
        height: 400,
        sortName: "createTime",
        // search: true,
        striped: true,
        showToggle: true,
        showRefresh: true,
        showExport: true, //是否显示导出按钮
        // exportDataType: 'all',
        uniqueId: "id",
        clickToSelect: true, // 设置 true 将在点击行时，自动选择 rediobox 和 checkbox。
        checkboxHeader: false, // 设置 false 将在列头隐藏全选复选框。
        // 分页参数
        method: "get", // get方式提交
        url: "exp/all", // 获取数据
        pagination: true, // 显示分页条
        sidePagination: 'server', // 在服务器端分页
        pageNumber: 1, // 初始化展示第一页
        pageSize: 5, // 每页 10 条数据
        pageList: [5, 10, 25, 50, 100, "ALL"],
        queryParamsType: "limit", // 使用RESTFul格式的参数 可以不写 默认就是limit
        queryParams: queryParamsFunc, // 向后台传的参数
        responseHandler: responseHandlerFun, // 修改返回的数据格式
    };

    /**
     * 初始化模态框中的实验表格
     */
    function initExpsTable() {
        $("#EXP_ExpsTable").bootstrapTable(expsTableOptions);
        // 注册表格onAll事件
        $("#EXP_ExpsTable").on("all.bs.table", function (name, args) {
            checkEXP_ChooseExpInModalBtn();
        });
    }

    // 禁用按钮
    function disabledBtn($element) {
        $element.attr("disabled", "true");
    }

    // 启用按钮
    function enableBtn($element) {
        $element.removeAttr("disabled");
    }

    // 检查表格是否有内容被check
    function checkEXP_ChooseExpInModalBtn() {
        var selections = $("#EXP_ExpsTable").bootstrapTable("getSelections");
        if (selections.length <= 0) {
            disabledBtn($("#EXP_ChooseExpInModalBtn")); // 禁用按钮
        } else {
            enableBtn($("#EXP_ChooseExpInModalBtn")); // 启用按钮
        }
    }

    function checkEXP_CloseInModalBtn() {
        if ($("#EXP_Id").attr("data-exp-id") === "") {
            disabledBtn($("#EXP_CloseInModalBtn"));
        } else {
            enableBtn($("#EXP_CloseInModalBtn"));
        }
    }

    // 刷新表格
    function refreshTable(jqueryObj) {
        // 刷新 EXP_ChooseExpModal 的表格
        var options = jqueryObj.bootstrapTable("getOptions");
        jqueryObj.bootstrapTable("refresh", options);
    }

    // 显示模态框
    function showModal($modal) {
        $modal.modal("show");
    }

    // 获取 exp_id
    function getExpId() {
        return parseInt($("#EXP_Id").attr("data-exp-id"));
    }

    // ---------------------------------- Exps Table Modal End ----------------------------------- //

    // ---------------------------------- Init Components Begin ----------------------------------- //

    function initComponents() {
        var successFun = function (timelineList) {
            // 初始化时间轴
            initTimeline(timelineList);
        };

        $.ajax({
            url: "timeline/getAllByExpId",
            data: {
                expId: getExpId(),
            },
            type: "GET",
            dataType: "json",
            success: function (result) {
                if (!Global.checkServerMsg(result)) return;
                successFun(result["extend"]["list"]);
            }
        });
    }

    /**
     * 当 Timeline Node 被选中时调用
     * @type {{addFunc, removeFunc, run}}
     */
    var selectedChangeEvent = function () {
        var funcs = {};

        return {
            addFunc: function (key, func) {
                funcs[key] = func;
            },
            removeFunc: function (id) {
                for (var key in funcs) {
                    if (key === id && funcs.hasOwnProperty(key)) {
                        delete funcs[key];
                    }
                }
            },
            removeAllFuncs: function () {
                for (var key in funcs) {
                    if (funcs.hasOwnProperty(key)) {
                        delete funcs[key];
                    }
                }
            },
            run: function (data) {
                $.each(funcs, function (index, func) {
                    func(data);
                });
            }
        }
    }();

    // ---------------------------------- Init Components End ----------------------------------- //

    // ---------------------------------- Timeline Begin ----------------------------------- //
    var timelines, eventsMinDistance;

    /**
     * 初始化时间轴
     */
    function initTimeline(timelineList) {
        timelines = $('.cd-horizontal-timeline');
        eventsMinDistance = 60;
        timelines.each(function () {
            var timeline = $(this);
            var timelineComponents = {};

            // clear Timeline components
            clearTimeline(timeline);

            //cache timeline components
            timelineComponents['timelineWrapper'] = timeline.find('.events-wrapper');
            timelineComponents['eventsWrapper'] = timelineComponents['timelineWrapper'].children('.events');
            timelineComponents['fillingLine'] = timelineComponents['eventsWrapper'].children('.filling-line');
            timelineComponents['timelineEvents'] = setEvents(timelineComponents['eventsWrapper'], timelineList);
            timelineComponents['timelineNavigation'] = timeline.find('.cd-timeline-navigation');

            //assign a left postion to the single events along the timeline
            setDatePosition(timelineComponents, eventsMinDistance);
            //assign a width to the timeline
            var timelineTotWidth = setTimelineWidth(timelineComponents, eventsMinDistance);
            //the timeline has been initialize - show it
            timeline.addClass('loaded');
            showNewContent(timelineComponents, timelineTotWidth, 'prev', 'first');

            //detect click on the next arrow
            timelineComponents['timelineNavigation'].off('click', '.next');
            timelineComponents['timelineNavigation'].on('click', '.next', function (event) {
                event.preventDefault(); // 为了防止 a 标签发生页面跳转
                updateSlide(timelineComponents, timelineTotWidth, 'next');
            });
            //detect click on the prev arrow
            timelineComponents['timelineNavigation'].off('click', '.prev');
            timelineComponents['timelineNavigation'].on('click', '.prev', function (event) {
                event.preventDefault();
                updateSlide(timelineComponents, timelineTotWidth, 'prev');
            });
            //detect click on the a single event - show new event content
            timelineComponents['eventsWrapper'].off('click', 'a');
            timelineComponents['eventsWrapper'].on('click', 'a', function (event) {
                event.preventDefault();
                timelineComponents['timelineEvents'].removeClass('selected');
                $(this).addClass('selected');
                updateOlderEvents($(this));
                updateFilling($(this), timelineComponents['fillingLine'], timelineTotWidth);
                // 改变其他组件的值
                updateOtherComponents($(this));
            });

            //keyboard navigation
            $(document).off('keyup');
            $(document).keyup(function (event) {
                if (event.keyCode === 37 && elementInViewport(timeline.get(0))) {
                    showNewContent(timelineComponents, timelineTotWidth, 'prev', 1);
                } else if (event.keyCode === 39 && elementInViewport(timeline.get(0))) {
                    showNewContent(timelineComponents, timelineTotWidth, 'next', 1);
                }
            });

            // 注册 btn-group 的按钮事件
            if ($("#EXP_PlayBtn").hasClass("red")) {
                $("#EXP_PlayBtn").trigger('click');
            }
            registerPlayBtnGroup(timelineComponents, timelineTotWidth);
        });
    }

    function clearTimeline(timeline) {
        timeline.find('ol').empty();
    }

    function setEvents(eventsWrapper, timelines) {
        var ol = eventsWrapper.find("ol");
        $.each(timelines, function (index, item) {
            ol.append('<li><a href="#0" data-id="' + item["id"] + '" data-time="' + item["time"] + '" ' +
                'class="border-after-red bg-after-red ' + (index === 0 ? 'selected' : '') + '">' +
                index + '</a></li>');
        });
        return eventsWrapper.find('a');
    }

    function updateSlide(timelineComponents, timelineTotWidth, string) {
        //retrieve translateX value of timelineComponents['eventsWrapper']
        var translateValue = getTranslateValue(timelineComponents['eventsWrapper']),
            wrapperWidth = Number(timelineComponents['timelineWrapper'].css('width').replace('px', ''));
        //translate the timeline to the left('next')/right('prev')
        (string === 'next')
            ? translateTimeline(timelineComponents, translateValue - wrapperWidth + eventsMinDistance, wrapperWidth - timelineTotWidth)
            : translateTimeline(timelineComponents, translateValue + wrapperWidth - eventsMinDistance);
    }

    function updateTimelinePosition(string, event, timelineComponents) {
        //translate timeline to the left/right according to the position of the selected event
        var eventStyle = window.getComputedStyle(event.get(0), null),
            eventLeft = Number(eventStyle.getPropertyValue("left").replace('px', '')),
            timelineWidth = Number(timelineComponents['timelineWrapper'].css('width').replace('px', '')),
            timelineTotWidth = Number(timelineComponents['eventsWrapper'].css('width').replace('px', ''));
        var timelineTranslate = getTranslateValue(timelineComponents['eventsWrapper']);

        if ((string === 'next' && eventLeft > timelineWidth - timelineTranslate) || (string === 'prev' && eventLeft < -timelineTranslate)) {
            translateTimeline(timelineComponents, -eventLeft + timelineWidth / 2, timelineWidth - timelineTotWidth);
        }
    }

    function translateTimeline(timelineComponents, value, totWidth) {
        var eventsWrapper = timelineComponents['eventsWrapper'].get(0);
        value = (value > 0) ? 0 : value; //only negative translate value
        value = (!(typeof totWidth === 'undefined') && value < totWidth) ? totWidth : value; //do not translate more than timeline width
        setTransformValue(eventsWrapper, 'translateX', value + 'px');
        //update navigation arrows visibility
        (value === 0) ? timelineComponents['timelineNavigation'].find('.prev').addClass('inactive') : timelineComponents['timelineNavigation'].find('.prev').removeClass('inactive');
        (value === totWidth) ? timelineComponents['timelineNavigation'].find('.next').addClass('inactive') : timelineComponents['timelineNavigation'].find('.next').removeClass('inactive');
    }

    function updateFilling(selectedEvent, filling, totWidth) {
        //change .filling-line length according to the selected event
        var eventStyle = window.getComputedStyle(selectedEvent.get(0), null),
            eventLeft = eventStyle.getPropertyValue("left"),
            eventWidth = eventStyle.getPropertyValue("width");
        eventLeft = Number(eventLeft.replace('px', '')) + Number(eventWidth.replace('px', '')) / 2;
        var scaleValue = eventLeft / totWidth;
        setTransformValue(filling.get(0), 'scaleX', scaleValue);
    }

    function setDatePosition(timelineComponents, min) {
        $.each(timelineComponents['timelineEvents'], function (index, item) {
            $(item).css('left', (index + 1) * min + 'px');
        });
    }

    function setTimelineWidth(timelineComponents, width) {
        var totalWidth = (timelineComponents['timelineEvents'].length + 2) * width;
        timelineComponents['eventsWrapper'].css('width', totalWidth + 'px');
        updateFilling(timelineComponents['eventsWrapper'].find('a.selected'), timelineComponents['fillingLine'], totalWidth);
        updateTimelinePosition('next', timelineComponents['eventsWrapper'].find('a.selected'), timelineComponents);

        return totalWidth;
    }

    function updateOlderEvents(event) {
        event.parent('li').prevAll('li').children('a').addClass('older-event').end().end().nextAll('li').children('a').removeClass('older-event');
    }

    function getTranslateValue(timeline) {
        var translateValue;
        var timelineStyle = window.getComputedStyle(timeline.get(0), null);
        var timelineTranslate = timelineStyle.getPropertyValue("-webkit-transform") ||
            timelineStyle.getPropertyValue("-moz-transform") ||
            timelineStyle.getPropertyValue("-ms-transform") ||
            timelineStyle.getPropertyValue("-o-transform") ||
            timelineStyle.getPropertyValue("transform");

        if (timelineTranslate.indexOf('(') >= 0) {
            timelineTranslate = timelineTranslate.split('(')[1];
            timelineTranslate = timelineTranslate.split(')')[0];
            timelineTranslate = timelineTranslate.split(',');
            translateValue = timelineTranslate[4];
        } else {
            translateValue = 0;
        }

        return Number(translateValue);
    }

    function setTransformValue(element, property, value) {
        element.style["-webkit-transform"] = property + "(" + value + ")";
        element.style["-moz-transform"] = property + "(" + value + ")";
        element.style["-ms-transform"] = property + "(" + value + ")";
        element.style["-o-transform"] = property + "(" + value + ")";
        element.style["transform"] = property + "(" + value + ")";
    }

    /*
        How to tell if a DOM element is visible in the current viewport?
        http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
    */
    function elementInViewport(el) {
        var top = el.offsetTop;
        var left = el.offsetLeft;
        var width = el.offsetWidth;
        var height = el.offsetHeight;

        while (el.offsetParent) {
            el = el.offsetParent;
            top += el.offsetTop;
            left += el.offsetLeft;
        }

        return (
            top < (window.pageYOffset + window.innerHeight) &&
            left < (window.pageXOffset + window.innerWidth) &&
            (top + height) > window.pageYOffset &&
            (left + width) > window.pageXOffset
        );
    }

    function showNewContent(timelineComponents, timelineTotWidth, string, step) {
        //go from one event to the next/previous one
        var selectedDate = timelineComponents['eventsWrapper'].find('.selected');
        var newEvent = selectedDate;
        if (typeof step === 'string') {
            newEvent = step === 'first' ? newEvent.parent('li').parent('ol').find('li').first().find('a') : newEvent.parent('li').parent('ol').find('li').last().find('a');
        } else if (typeof step === 'number') {
            for (var i = 0; i < step; i++) {
                if (string === 'next') {
                    if (newEvent.parent('li').next('li').children('a').length <= 0) // 如果没有下一个
                        break;
                    newEvent = newEvent.parent('li').next('li').children('a');
                }
                else {
                    if (newEvent.parent('li').prev('li').children('a').length <= 0) // 如果没有上一个
                        break;
                    newEvent = newEvent.parent('li').prev('li').children('a');
                }
            }
        } else {
            newEvent = string === 'next' ? newEvent.parent('li').next('li').children('a') : newEvent.parent('li').prev('li').children('a');
        }

        if (newEvent.hasClass('selected') && step !== 'first')
            return;

        if (newEvent.length > 0) { //if there's a next/prev event - show it
            updateFilling(newEvent, timelineComponents['fillingLine'], timelineTotWidth);
            selectedDate.removeClass('selected');
            newEvent.addClass('selected');
            updateOlderEvents(newEvent);
            updateTimelinePosition(string, newEvent, timelineComponents);

            // 改变其他组件的值
            updateOtherComponents(newEvent);
        }
    }

    function registerPlayBtnGroup(timelineComponents, timelineTotWidth) {
        var intervalID;
        $("#EXP_PlayBtn").off("click");
        $("#EXP_PlayBtn").on("click", function () {
            $(this).toggleClass("blue");
            $(this).toggleClass("red");
            $(this).find("i").toggleClass("fa-play");
            $(this).find("i").toggleClass("fa-pause");
            if ($(this).hasClass("red")) {
                intervalID = setInterval(function () {
                    showNewContent(timelineComponents, timelineTotWidth, 'next', 1);
                }, 1000);
            } else {
                clearInterval(intervalID);
            }
        });
        $("#EXP_FastBackwardBtn").off("click");
        $("#EXP_FastBackwardBtn").on("click", function () {
            BtnsFuncWrap(function () {
                showNewContent(timelineComponents, timelineTotWidth, 'prev', 'first');
            });
        });
        $("#EXP_BackwardBtn").off("click");
        $("#EXP_BackwardBtn").on("click", function () {
            BtnsFuncWrap(function () {
                showNewContent(timelineComponents, timelineTotWidth, 'prev', 1);
            });
        });
        $("#EXP_ForwardBtn").off("click");
        $("#EXP_ForwardBtn").on("click", function () {
            BtnsFuncWrap(function () {
                showNewContent(timelineComponents, timelineTotWidth, 'next', 1);
            });
        });
        $("#EXP_FastForwardBtn").off("click");
        $("#EXP_FastForwardBtn").on("click", function () {
            BtnsFuncWrap(function () {
                showNewContent(timelineComponents, timelineTotWidth, 'next', 'last');
            });
        });

        function BtnsFuncWrap(func) {
            if ($("#EXP_PlayBtn").hasClass("red")) {
                clearInterval(intervalID);
            }
            func();
            if ($("#EXP_PlayBtn").hasClass("red")) {
                intervalID = setInterval(function () {
                    showNewContent(timelineComponents, timelineTotWidth, 'next', 1);
                }, 1000);
            }
        }
    }

    /**
     * 更新其他组件的值
     * @param event
     */
    function updateOtherComponents(event) {
        // 更新进度条，实现联动
        var olEle = $("#EXP_Timeline").find("ol");
        var noOfSelected = parseInt(olEle.find(".selected").text()) + 1.0;
        var percent = noOfSelected / olEle.find("li").length * 100;
        $("#EXP_Progress").find(".progress-bar").width(percent + "%");
        $("#EXP_Progress").find("span").text(parseInt(percent) + "%");

        var timelineNodeId = parseInt(event.data('id'));
        // 更新全局变量 Basic Info
        $.get("timeline/getById", {id: timelineNodeId}, function (tlData) {
            if (!Global.checkServerMsg(tlData)) return;
            var timelineNode = tlData["extend"]["timelineNode"];
            $("#EXP_Time").html(Global.formatTime(timelineNode["time"]));
            $.get("globalVars/getByTimelineNodeId", {timelineNodeId: timelineNodeId}, function (gvData) {
                if (!Global.checkServerMsg(gvData)) return;
                var globalVars = gvData["extend"]["globalVars"];
                $("#EXP_GlobalIns").html(globalVars["globalInstrumentCount"]);
                $("#EXP_DynReadIns").html(globalVars["dynamicReadInstrument"]);
                $("#EXP_DynWriteIns").html(globalVars["dynamicWriteInstrument"]);
                $("#EXP_StaticReadIns").html(globalVars["staticReadInstrument"]);
                $("#EXP_StaticWriteIns").html(globalVars["staticWriteInstrument"]);
            });
        });

        // 更新 Memory Object Info
        $.get("motnVO/getListByTimelineNodeId", {timelineNodeId: timelineNodeId}, function (result) {
            if (!Global.checkServerMsg(result)) return;
            var extend = result["extend"];
            // Tree
            selectedChangeEvent.run(extend);
        });
    }

    // ---------------------------------- Timeline End ----------------------------------- //

    // ---------------------------------- Progress Begin ----------------------------------- //
    function initProgress() {
        $("#EXP_Progress").mouseenter(function () {
            $(this).find("span").removeClass('sr-only');
        });
        $("#EXP_Progress").mouseleave(function () {
            $(this).find("span").addClass('sr-only');
        });
    }

    // ---------------------------------- Progress End ----------------------------------- //

    // ====================== jsTree ======================== //
    /**
     * 内存对象 Tree 结构 init
     * @private
     * @example https://www.jstree.com/api/
     */
    var initMemTree = function () {
        $('#EXP_MemTree').jstree({
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
                        "id": "EXP_Tree_Inactive",
                        "text": "Inactive Memory Object",
                        "icon": "fa fa-hourglass-end",
                    },
                    {
                        "id": "EXP_Tree_Active",
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
        $('#EXP_MemTree_Search').keyup(function () {
            if (to) {
                clearTimeout(to);
            }
            to = setTimeout(function () {
                var v = $('#EXP_MemTree_Search').val();
                $('#EXP_MemTree').jstree(true).search(v);
                $('#EXP_Tree_Inactive li').hide();
                $('#EXP_Tree_Active li').hide();
                $('a.jstree-search').parent('li').show();
                var instance = $('#EXP_MemTree').jstree(true);
                if (v === "") {
                    instance.show_all();
                }
            }, 250);
        });

        // 当 Tree 加载完毕之后触发
        $("#EXP_MemTree").on("ready.jstree", function (e, data) {
            // 触发选中事件
            selectedChangeEvent.addFunc("updateTree", function (extend) {
                var time = extend["time"];
                var motls = extend["list"];
                // Tree instance
                var instance = data.instance;
                $.each(motls, function (index, item) {
                    var metaObject = item["metaObject"];
                    var tmas = item["tmaList"];
                    var isActive = metaObject["startTime"] <= time && time <= metaObject["endTime"];
                    // update node
                    var nodeActiveId = "EXP_Active_" + metaObject["id"];
                    var nodeMasterId = "EXP_Master_" + metaObject["id"];
                    if (isActive) {
                        // update active node
                        instance.delete_node(nodeMasterId);
                        if (!instance.get_node(nodeActiveId, false)) {
                            instance.create_node("EXP_Tree_Active", {
                                "id": nodeActiveId,
                                "text": metaObject["varName"],
                                "data": {"metaObject": metaObject, "status": "active"},
                                "icon": "fa fa-circle",
                            });
                        }
                    } else {
                        // update master node
                        instance.delete_node(nodeActiveId);
                        if (!instance.get_node(nodeMasterId, false)) {
                            instance.create_node("EXP_Tree_Inactive", {
                                "id": nodeMasterId,
                                "text": metaObject["varName"],
                                "data": {"metaObject": metaObject, "status": "inactive"},
                                "icon": "fa fa-circle",
                            });
                        }
                    }
                })
            });
        });

        // 当一个节点被 check 之后触发
        $("#EXP_MemTree").on("check_node.jstree", function (e, data) {
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
                var metaObject = node.data.metaObject;
                // 如果表格里没有就添加
                if (memTableObjIds.indexOf(metaObject["id"]) < 0) {
                    memTableObjIds.push(metaObject["id"]);  // 更新 memTableObjIds
                    var rowData = {
                        id: metaObject["id"],
                        varName: metaObject["varName"],
                        startAddress: metaObject["startAddress"],
                        endAddress: metaObject["endAddress"],
                        size: metaObject["size"],
                        creatorThreadId: metaObject["creatorThreadId"],
                        ip: metaObject["ip"],
                        sourceCodeInfo: metaObject["sourceCodeInfo"],
                        allocFunc: metaObject["allocFunc"],
                        allocType: metaObject["allocType"],
                        startTime: metaObject["startTime"],
                        endTime: metaObject["endTime"],
                        startInstruction: metaObject["startInstruction"],
                        endInstruction: metaObject["endInstruction"],
                        startMemoryInstruction: metaObject["startMemoryInstruction"],
                        endMemoryInstruction: metaObject["endMemoryInstruction"],
                        status: node.data.status,
                    };
                    rowDatas.push(rowData);
                }
            });
            memTablePrepend(rowDatas);
        });

        // 当一个节点被 uncheck 之后触发
        $("#EXP_MemTree").on("uncheck_node.jstree", function (e, data) {
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
                var objId = node.data.metaObject.id;
                // 更新 memTableObjIds
                var i = memTableObjIds.indexOf(objId);
                if (i >= 0) {
                    memTableObjIds.splice(i, 1);
                    objIds.push(objId);
                }
            });
            memTableRemove({"field": "id", "values": objIds});
        });
    };
    // ====================== jsTree ======================== //

    // 缓存 Memory Object 表格里面的 ObjIds
    var memTableObjIds = [];

    // ====================== Memory Table ======================== //
    // looking for http://bootstrap-table.wenzhixin.net.cn/zh-cn/documentation/
    /**
     * Master Table init
     * @private
     */
    var initMemTable = function () {
        var table = $("#EXP_MemTable");
        table.bootstrapTable({
            columns: [
                {
                    field: "id",
                    title: "Id",
                    visible: false,
                    sortable: true,
                    halign: "right",
                    align: "right",
                }, {
                    field: "varName",
                    title: "Name",
                    sortable: true,
                }, {
                    field: "startAddress",
                    title: "Start Address",
                    sortable: true,
                    halign: "right",
                    align: "right",
                }, {
                    field: "endAddress",
                    title: "End Address",
                    sortable: true,
                    halign: "right",
                    align: "right",
                }, {
                    field: "size",
                    title: "Size",
                    sortable: true,
                    halign: "right",
                    align: "right",
                }, {
                    field: "creatorThreadId",
                    title: "Created Thread Id",
                    visible: false,
                    sortable: true,
                    halign: "right",
                    align: "right",
                }, {
                    field: "ip",
                    title: "IP",
                    visible: false,
                    halign: "right",
                    align: "right",
                }, {
                    field: "sourceCodeInfo",
                    title: "Source Code Info",
                }, {
                    field: "allocType",
                    title: "Alloc Type",
                    sortable: true,
                }, {
                    field: "allocFunc",
                    title: "Alloc Func",
                    sortable: true,
                }, {
                    field: "startTime",
                    title: "Start Time",
                    sortable: true,
                    halign: "right",
                    align: "right",
                }, {
                    field: "endTime",
                    title: "End Time",
                    sortable: true,
                    halign: "right",
                    align: "right",
                }, {
                    field: "startInstruction",
                    title: "Start Instruction",
                    visible: false,
                    sortable: true,
                    halign: "right",
                    align: "right",
                }, {
                    field: "endInstruction",
                    title: "End Instruction",
                    visible: false,
                    sortable: true,
                    halign: "right",
                    align: "right",
                }, {
                    field: "startMemoryInstruction",
                    title: "Start Memory Instruction",
                    visible: false,
                    sortable: true,
                    halign: "right",
                    align: "right",
                }, {
                    field: "endMemoryInstruction",
                    title: "End Memory Instruction",
                    visible: false,
                    sortable: true,
                    halign: "right",
                    align: "right",
                }, {
                    field: "status",
                    title: "status",
                },
            ],
            data: [],
            showColumns: true,
            height: 400,
            sortName: "varName",
            search: true,
            showRefresh: true,
            showExport: true, //是否显示导出按钮
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
    var memTableLoad = function (data) {
        $("#EXP_MemTable").bootstrapTable('load', data);
    };

    /**
     * 添加数据到表格在现有数据之后。
     * @param data 该参数应该与上面中的例子具有相同的格式
     * @private
     * @example http://issues.wenzhixin.net.cn/bootstrap-table/#methods/append.html
     */
    var memTableAppend = function (data) {
        $("#EXP_MemTable").bootstrapTable('append', data);
    };

    /**
     * 添加数据到表格在现有数据之前。
     * @param data 该参数应该与上面中的例子具有相同的格式
     * @private
     * @example http://issues.wenzhixin.net.cn/bootstrap-table/#methods/prepend.html
     */
    var memTablePrepend = function (data) {
        $("#EXP_MemTable").bootstrapTable('prepend', data);
    };

    /**
     * 插入新行，参数包括：
     * index: 要插入的行的 index，
     * row: 行的数据，Object 对象。
     * @param params
     * @private
     * @example http://issues.wenzhixin.net.cn/bootstrap-table/#methods/insertRow.html
     */
    var memTableInsertRow = function (params) {
        $("#EXP_MemTable").bootstrapTable('insertRow', params);
    };

    /**
     * 从表格中删除数据，包括两个参数： field: 需要删除的行的 field 名称，
     * values: 需要删除的行的值，类型为数组。
     * @param params
     * @private
     * @example http://issues.wenzhixin.net.cn/bootstrap-table/#methods/remove.html
     */
    var memTableRemove = function (params) {
        $("#EXP_MemTable").bootstrapTable('remove', params);
    };

    /**
     * 删除表格所有数据
     * @private
     * @example http://issues.wenzhixin.net.cn/bootstrap-table/#methods/removeAll.html
     */
    var _memTableRemoveAll = function () {
        $("#EXP_MemTable").bootstrapTable('removeAll');
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
        $("#EXP_MemTable").bootstrapTable('updateRow', params);
    };
    // ====================== MasterTable ======================== //

    // ====================== Memory Object Select ======================== //
    var initMemSelect = function () {
        // 加个颜色
        $("#EXP_MemSelect").selectpicker({
            style: "btn-success",
        });
    };
    // ====================== Memory Object Select ======================== //

    // ====================== Memory Object HeatMap ======================== //
    var memHeatmapInit = function () {
        // x 轴和 y 轴的长度
        var numOfX = 30;
        var numOfY = 6;
        // 记录 cell 是否已经被占用
        var isHold = createTwoDimensionArray(numOfX, numOfY);
        // 记录已经出现的内存对象的位置（key：objId，value：[x, y]）
        var objPos = [];

        // heatmap 所需变量
        var memHeatmap = echarts.init(document.getElementById("EXP_MemHeatmap"), theme);

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
                position: 'top',
            },
            animation: false,
            // 直角坐标系内绘图网格，单个 grid 内最多可以放置上下两个 X 轴，左右两个 Y 轴。
            grid: {
                height: '50%', // grid 组件的高度
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
                splitArea: {show: true,},// 显示分割区域
                splitLine: {show: false}, // 显示分割线
                axisLine: {show: false}, // 取消坐标轴线
                axisTick: {show: false}, // 取消坐标轴刻度
            },
            // 直角坐标系 grid 中的 y 轴
            yAxis: {
                type: 'category',
                data: yData,
                splitArea: {show: true,},// 显示分割区域
                splitLine: {show: false}, // 显示分割线
                axisLine: {show: false}, // 取消坐标轴线
                axisTick: {show: false}, // 取消坐标轴刻度
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

        // 刷新热力图事件
        selectedChangeEvent.addFunc("heatmap", function (extend) {
            var time = extend["time"];
            var motls = extend["list"];
            // 每个内存对象的访存信息
            var objs = [];
            // 汇总每个线程 TLS 的访存信息
            $.each(motls, function (index1, motl) {
                $.each(motl["tmaList"], function (index2, tma) {
                    if (objs.hasOwnProperty(motl["metaObject"]["id"])) {
                        var obj = objs[motl["metaObject"]["id"]];
                        obj["read"] += tma["dynamicRead"];
                        obj["write"] += tma["dynamicWrite"];
                        obj["read_in_cache"] += tma["readInCache"];
                        obj["strided_read"] += tma["stridedRead"];
                        obj["pointerchasing_read"] += tma["pointerChasingRead"];
                        obj["random_read"] += tma["randomRead"];
                    } else {
                        objs[motl["metaObject"]["id"]] = {};
                        var obj = objs[motl["metaObject"]["id"]];
                        obj["metaObject"] = motl["metaObject"];
                        obj["read"] = tma["dynamicRead"];
                        obj["write"] = tma["dynamicWrite"];
                        obj["read_in_cache"] = tma["readInCache"];
                        obj["strided_read"] = tma["stridedRead"];
                        obj["pointerchasing_read"] = tma["pointerChasingRead"];
                        obj["random_read"] = tma["randomRead"];
                    }
                });
            });

            // 修改 heapmapData
            heapmapData = []; // 先清空
            for (var objId in objs) {
                var obj = objs[objId];
                var cell = getCell(objId);
                cell.push(obj["metaObject"]["id"]);
                cell.push(obj["read"]);
                cell.push(obj["write"]);
                cell.push(obj["read_in_cache"]);
                cell.push(obj["strided_read"]);
                cell.push(obj["pointerchasing_read"]);
                cell.push(obj["random_read"]);
                cell.push(obj["metaObject"]["varName"]);
                heapmapData.push(cell);
                visualMapMax = Math.max(visualMapMax, obj["read"], obj["write"]);
                // 更新 memObjWRData 并刷新 Pie
                if (cell[2] === memObjWRData[2]) {
                    memObjWRData = cell;
                    if (memObjPieKind === "R") {
                        renderOneMemObjReadPie(memObjWRData);
                    } else {
                        renderOneMemObjReadWritePie(memObjWRData);
                    }
                }
            }
            // 刷新 heapmap
            option.series[0].data = heapmapData;
            option.visualMap.max = visualMapMax;
            memHeatmap.setOption(option);
        });

        /**
         * 返回一个未使用的 cell
         * @param objId 内存对象id
         * @returns {Array}
         * @private
         */
        var getCell = function (objId) {
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
        $('#EXP_MemSelect').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
            var dim = $("#EXP_MemSelect").val(); // 维度
            var text = $("#EXP_MemSelect").find("option:selected").text();
            option.visualMap.dimension = dim;
            option.series[0].name = text;
            option.series[0].label.formatter = function (params) {
                return params.data[dim];
            };
            option.series[0].tooltip.formatter = function (params, ticket, callback) {
                return "<b>" + params.data[9] + "</b>" + "<br>" + text + "<br>" + params.data[dim];
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
                        renderOneMemObjReadPie(data);
                    } else {
                        renderOneMemObjReadWritePie(data);
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
     *              2：metaObject
     *              3：read
     *              4：write"
     *              5：read_in_cache
     *              6：strided_read
     *              7：pointerchasing_read
     *              8：random_read
     * @private
     */
    var renderOneMemObjReadPie = function (data) {
        var pieData = [];
        pieData.push({value: data[5], name: "read in cache"});
        pieData.push({value: data[6], name: "strided read"});
        pieData.push({value: data[7], name: "pointer read"});
        pieData.push({value: data[8], name: "random read"});

        var oneMemObjPie = echarts.getInstanceByDom(document.getElementById("EXP_OneMemObjPie"));
        var option = oneMemObjPie.getOption();
        option.series[0].data = pieData;
        option.series[0].name = "read pie";
        option.title[0].text = data[9];

        oneMemObjPie.setOption(option);

        $('#EXP_OneMemObjShowRW_Btn').removeClass("active").removeAttr("disabled");
    };

    /**
     * 渲染 memObj Read/Write Pie
     * @param data  0：x
     *              1：y
     *              2：metaObject
     *              3：read
     *              4：write"
     *              5：read_in_cache
     *              6：strided_read
     *              7：pointerchasing_read
     *              8：random_read
     * @private
     */
    var renderOneMemObjReadWritePie = function (data) {
        var pieData = [];
        pieData.push({value: data[3], name: "read"});
        pieData.push({value: data[4], name: "write"});

        var oneMemObjPie = echarts.getInstanceByDom(document.getElementById("EXP_OneMemObjPie"));
        var option = oneMemObjPie.getOption();
        option.series[0].data = pieData;
        option.series[0].name = "read/write pie";
        option.title[0].text = data[9];

        oneMemObjPie.setOption(option);

        $('#EXP_OneMemObjShowR_Btn').removeClass("active").removeAttr("disabled");
    };

    // ====================== One Memory Object Btn ======================== //
    var oneMemObjBtnInit = function () {
        $('#EXP_OneMemObjShowR_Btn').attr({disabled: "disabled"});
        $('#EXP_OneMemObjShowRW_Btn').attr({disabled: "disabled"});
        $('#EXP_OneMemObjShowR_Btn').on("click", function () {
            renderOneMemObjReadPie(memObjWRData);
            $(this).addClass("active").attr({disabled: "disabled"});
            memObjPieKind = "R";
        });
        $('#EXP_OneMemObjShowRW_Btn').on("click", function () {
            renderOneMemObjReadWritePie(memObjWRData);
            $(this).addClass("active").attr({disabled: "disabled"});
            memObjPieKind = "RW";
        });
    };
    // ====================== One Memory Object Btn ======================== //

    // ====================== One Memory Object Read Sector ======================== //
    var oneMemObjPieInit = function () {
        var oneMemObjPie = echarts.init(document.getElementById("EXP_OneMemObjPie"), theme);
        var option = {
            title: {
                text: "",
                left: '0%',
                top: '10%',
            },
            tooltip: {
                trigger: "item",
                formatter: "{a} <br/>{b} : {c} ({d}%)",
            },
            legend: {
                // orient: 'vertical',
                bottom: '10%',
                left: 'center',
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
                },
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
    var createTwoDimensionArray = function (x, y) {
        var rs = [];
        for (var i = 0; i < x; i++) {
            rs[i] = [];
            for (var j = 0; j < y; j++) {
                rs[i][j] = -1;
            }
        }
        return rs;
    };

    // ---------------------------------- DB Utils Begin ----------------------------------- //

    // ---------------------------------- DB Utils End ----------------------------------- //

    return {
        init: function () {
            initExpsTable(); // 初始化模态框的exp表格
            showModal($("#EXP_ChooseExpModal")); // 进入页面就打开该#EXP_ChooseExpModal模态框
            checkEXP_CloseInModalBtn();
            initProgress();
            initMemTree();
            initMemTable();
            initMemSelect();
            memHeatmapInit();
            oneMemObjBtnInit();
            oneMemObjPieInit();
        },
        chooseExpOnclick: function () {
            checkEXP_ChooseExpInModalBtn();
            checkEXP_CloseInModalBtn();
        },
        saveExpOnclick: function () {
            // 修改 exp，发送 ajax
            $("#EXP_EditExpModal input").removeAttr("readonly");
            var id = parseInt($("#EXP_EditExpModal [name=id]").val());
            var description = $("#EXP_EditExpModal [name=description]").val();
            $("#EXP_EditExpModal input").attr("readonly", "readonly");
            $.ajax({
                url: "exp/putDesc",
                data: {
                    id: id,
                    description: description,
                },
                type: "POST",
                dataType: "json",
                success: function (result) {
                    if (!Global.checkServerMsg(result)) return;
                    $("#EXP_EditExpModal").modal("hide");
                    // 刷新 EXP_ChooseExpModal 的表格
                    refreshTable($("#EXP_ExpsTable"));
                }
            });
        },
        chooseExpInModalOnclick: function () {
            $("#EXP_Id").attr("data-exp-id", $("#EXP_ExpsTable").bootstrapTable("getSelections")[0]["id"]);
            // 关闭 EXP_ChooseExpModal 模态框
            $("#EXP_ChooseExpModal").modal("hide");

            // 初始化组件
            initComponents();
        }
    }
}();

jQuery(document).ready(function () {
    Experiment.init(); // init metronic core componets
});