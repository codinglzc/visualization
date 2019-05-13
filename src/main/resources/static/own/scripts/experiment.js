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
            title: "ID",
            visible: false,
            sortable: true,
            halign: "center",
            align: "right",
            width: "50px",
        }, {
            field: "createTime",
            title: "创建时间",
            visible: true,
            sortable: true,
            halign: "center",
            align: "right",
            width: "160px",
        }, {
            field: "consumeTime",
            title: "消耗时间",
            visible: true,
            sortable: true,
            halign: "center",
            align: "right",
            width: "130px",
            formatter: function (value, row, index, field) {
                return Global.formatTime(value);
            }
        }, {
            field: "description",
            title: "描述",
            visible: true,
            sortable: false,
            halign: "center",
            align: "left",
        }, {
            field: "numOfObjs",
            title: "内存对象个数",
            visible: false,
            sortable: false,
            halign: "center",
            align: "right",
            width: "100px",
        }, {
            field: "numOfTimeNodes",
            title: "时间节点个数",
            visible: false,
            sortable: false,
            halign: "center",
            align: "right",
            width: "100px",
        }, {
            field: "operate",
            title: "操作",
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
        var total = json["extend"]["pageInfo"]["totalElements"];
        var content = json["extend"]["pageInfo"]["content"];
        for (var i in content) {
            content[i]["numOfTimeNodes"] = countTimelineNodeByExpId(content[i]["id"]);
            content[i]["numOfObjs"] = countMetaObjectByExpId(content[i]["id"]);
        }

        return {
            total: total,
            rows: content,
        };
    };

    // 根据ExpId获取TimelineNode的个数
    var countTimelineNodeByExpId = function (expId) {
        var msg = $.ajax({
            url: "timeline/countByExpId",
            data: {expId: expId},
            type: "GET",
            async: false,
        })["responseJSON"];
        if (!Global.checkServerMsg(msg))
            return -1;
        return msg["extend"]["count"];
    };

    // 根据ExpId获取MetaObject的个数
    var countMetaObjectByExpId = function (expId) {
        var msg = $.ajax({
            url: "metaObj/countByExpId",
            data: {expId: expId},
            type: "GET",
            async: false,
        })["responseJSON"];
        if (!Global.checkServerMsg(msg))
            return -1;
        return msg["extend"]["count"];
    };

    var expsTableOptions = {
        locale: "zh-CN",
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
            locale: "zh-CN",
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
    var memScatterInit = function () {
        var displayKind = "size";

        var symbolSizeFunc = function (value) {
            //      0：x
            //      1：y
            //      2：objInfo
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

        // heatmap 所需变量
        var memScatter = echarts.init(document.getElementById("EXP_MemScatter"), theme);

        var option = {
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
                    var objInfo = params.data[2];
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

        memScatter.setOption(option);

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
                var accessVal = objs[objId];
                var objInfo = accessVal["metaObject"];
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
                var objInfo = objs[objId]["metaObject"];
                var allocType = objInfo["allocType"];
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
                var objInfo = objs[objId]["metaObject"];
                // 计算axis索引
                var allocType = objInfo["allocType"];
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
                //      2：metaInfo
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
                    accessVal["metaObject"],
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
                        renderOneMemObjReadPie(memObjWRData);
                    } else {
                        renderOneMemObjReadWritePie(memObjWRData);
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
                option.series[idx].data = data;
            });
            console.log(option);
            memScatter.setOption(option);
        });

        // 绑定 RT_MemSelect 选定事件
        $('#EXP_MemSelect').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
            displayKind = $("#EXP_MemSelect").val();
            memScatter.setOption(option);
        });

        // 绑定鼠标点击事件
        memScatter.on('click', function (params) {
            if (params.componentType === "series") {
                if (params.seriesType === "scatter") {
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
     * @param data  //      0：x
     //      1：y
     //      2：metaInfo
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
    var renderOneMemObjReadPie = function (data) {
        var pieData = [];
        pieData.push({value: data[5], name: "读（缓存命中）"});
        pieData.push({value: data[6], name: "读（固定间隔读）"});
        pieData.push({value: data[7], name: "读（指针访问读）"});
        pieData.push({value: data[8], name: "读（随机读）"});
        // pieData.push({value: data[3] - data[5] - data[6] - data[7], name: "读（随机读）"});

        var oneMemObjPie = echarts.getInstanceByDom(document.getElementById("EXP_OneMemObjPie"));
        var option = oneMemObjPie.getOption();
        option.series[0].data = pieData;
        option.series[0].name = "read pie";
        option.title[0].text = data[2]["varName"];

        oneMemObjPie.setOption(option);

        $('#EXP_OneMemObjShowRW_Btn').removeClass("active").removeAttr("disabled");
    };

    /**
     * 渲染 memObj Read/Write Pie
     * @param data  //      0：x
     //      1：y
     //      2：metaInfo
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
    var renderOneMemObjReadWritePie = function (data) {
        var pieData = [];
        pieData.push({value: data[3], name: "读"});
        pieData.push({value: data[4], name: "写"});

        var oneMemObjPie = echarts.getInstanceByDom(document.getElementById("EXP_OneMemObjPie"));
        var option = oneMemObjPie.getOption();
        option.series[0].data = pieData;
        option.series[0].name = "read/write pie";
        option.title[0].text = data[2]["varName"];

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

    // ---------------------------------- EXP_TimelineChart init Begin ----------------------------------- //
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
                rs.push("时间：" + params[0]['axisValue'] + " 秒 <br>");
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
            right: '10%',
            bottom: '10%',
            containLabel: true
        },
        toolbox: {
            feature: {
                dataZoom: {
                    yAxisIndex: 'none'
                },
                restore: {},
                saveAsImage: {}
            }
        },
        dataZoom: [
            {
                type: 'inside',
                start: 1,
                end: 100
            },
            {
                show: true,
                type: 'slider',
                bottom: '0%',
                start: 1,
                end: 100
            }
        ],
        xAxis: {
            type: 'value',
            name: '时间（秒）',
            nameTextStyle: {
                fontSize: 15
            },
        },
        yAxis: {
            type: 'value',
            name: '',
            nameTextStyle: {
                fontSize: 15
            },
        },
        series: []
    };

    var timelineChart;

    /**
     * 初始化 EChart
     */
    var lineInit = function () {
        timelineChart = echarts.init(document.getElementById('EXP_TimelineChart'), theme);
    };
    // ---------------------------------- EXP_TimelineChart init End ----------------------------------- //

    // ---------------------------------- EXP_MemObjSelect Begin ----------------------------------- //
    var memObjIdsSelects = [];
    var memObjWithAggregateInfoMap = [];

    var memObjSelectInit = function () {
        $.get("metaObj/byExpId", {expId: getExpId()}, function (ret) {
            if (!Global.checkServerMsg(ret)) {
                alert("$.get(\"metaObj/byExpId\" 失败！");
                return;
            }
            // 先清空
            $('#EXP_MemObjSelect').empty();
            $("#EXP_MemObjSelect").multiSelect("destroy");
            // 为EXP_MemObjSelect添加options
            var objIds = [];
            for (var i in  ret["extend"]["list"]) {
                var metaObj = ret["extend"]["list"][i];
                var $option = $('<option value="' + metaObj['id'] + '">' + metaObj['varName'] + '</option>');
                $('#EXP_MemObjSelect').append($option);
                objIds.push(metaObj['id']);
            }
            // 获取对象数据
            $.get("metaObj/getMetaObjsWithAggregateInfoByIds", {ids: objIds.join(",")}, function (res) {
                if (!Global.checkServerMsg(res)) {
                    alert("$.get(\"metaObj/getMetaObjsWithAggregateInfoByIds\" 失败！");
                    return;
                }
                memObjWithAggregateInfoMap = res["extend"]["map"];
                console.log(memObjWithAggregateInfoMap);
                // 初始化EXP_MemObjSelect
                $("#EXP_MemObjSelect").multiSelect({
                    keepOrder: true,
                    selectableOptgroup: true, // 当点击多选组时，将会移动组里所有元素至对面
                    selectableHeader: "<div class='text-info text-center'>可选对象</div>",
                    selectionHeader: "<div class='text-success text-center'>已选对象</div>",
                    afterSelect: function (values) {
                        Array.prototype.push.apply(memObjIdsSelects, values);
                        renderTimelineChar();
                    },
                    afterDeselect: function (values) {
                        memObjIdsSelects = $.grep(memObjIdsSelects, function (value) {
                            return $.inArray(value, values) < 0;
                        });
                        renderTimelineChar();
                    },
                });
                // 初始化 EXP_TypeSelect
                $('#EXP_TypeSelect').attr("disabled", false);
                $('#EXP_TypeSelect').removeClass("disabled");
                $("#EXP_TypeSelect").selectpicker();
                $('#EXP_TypeSelect').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
                    renderTimelineChar();
                });
            });
        });
    };

    var renderTimelineChar = function (kind) {
        var kind = $("#EXP_TypeSelect").val();
        timelineChart.clear();
        var legendData = [];
        var series = [];
        $.each(memObjWithAggregateInfoMap, function (key, value) {
            var id = key.split("#")[1].trim();
            if ($.inArray(id, memObjIdsSelects) >= 0) {
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
                    var pArr = [(objNode["time"] / 1000000.0).toFixed(2), objNode[kind]];
                    line["data"].push(pArr);
                });
                series.push(line);
            }
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
    // ---------------------------------- EXP_MemObjSelect End ----------------------------------- //


    return {
        init: function () {
            initExpsTable(); // 初始化模态框的exp表格
            showModal($("#EXP_ChooseExpModal")); // 进入页面就打开该#EXP_ChooseExpModal模态框
            checkEXP_CloseInModalBtn();
            initProgress();
            initMemTree();
            initMemTable();
            initMemSelect();
            memScatterInit();
            oneMemObjBtnInit();
            oneMemObjPieInit();
            lineInit();
        },
        chooseExpOnclick: function () {
            checkEXP_ChooseExpInModalBtn();
            checkEXP_CloseInModalBtn();
            // 刷新 EXP_ChooseExpModal 的表格
            refreshTable($("#EXP_ExpsTable"));
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
            $("#EXP_AppName").html($("#EXP_ExpsTable").bootstrapTable("getSelections")[0]["description"]);
            // 关闭 EXP_ChooseExpModal 模态框
            $("#EXP_ChooseExpModal").modal("hide");

            // 初始化组件
            initComponents();

            // 初始化 EXP_MemObjSelect
            memObjSelectInit();
        }
    }
}();

jQuery(document).ready(function () {
    Experiment.init(); // init metronic core componets
});