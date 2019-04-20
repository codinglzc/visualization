/**
 * <p>
 * 设置
 * </p>
 *
 * @author Liu Cong
 * @since 2019/4/10
 */
var Settings = function () {

    var $funcsTable = $("#SET_FuncsTable");
    var $funcAddBtn = $("#SET_AddBtn");
    var $funcRemoveBtn = $("#SET_RemoveBtn");
    var $addModal = $("#SET_AddModal");
    var $addBtnInAddModal = $("#SET_AddBtnInModal");
    var $editModal = $("#SET_EditModal");
    var $saveBtnInEditModal = $("#SET_SaveBtnInModal");
    var selections = [];


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
            $editModal.find("input[name='id']").val(row.id);
            $editModal.find("input[name='name']").val(row.name);
            $editModal.find("select[name='type'] option").removeAttr("selected");
            $editModal.find("select[name='type'] option[value='" + row.type + "']").attr("selected", true);
            $editModal.find("input[name='argIdItemSize']").val(row.argIdItemSize);
            $editModal.find("input[name='argIdItemNum']").val(row.argIdItemNum);
            $editModal.find("input[name='argIdPtrIndex']").val(row.argIdPtrIndex);
            $editModal.find("select[name='isInternal'] option").removeAttr("selected");
            $editModal.find("select[name='isInternal'] option[value='" + (row.isInternal ? 1 : 0) + "']").attr("selected", true);
            $editModal.modal("show");
        },
        'click .remove': function (e, value, row, index) {
            $.post("func/deleteByIds", {ids: row.id}, function (msg) {
                if (Global.checkServerMsg(msg)) {
                    $funcsTable.bootstrapTable("refresh");
                    $funcRemoveBtn.prop('disabled', true);
                } else {
                    alert("删除失败！");
                }
            });
        }
    };

    var columns = [
        {
            field: "state",
            checkbox: true,
            align: "center",
            width: "50px",
        }, {
            field: "id",
            title: "Id",
            visible: false,
            sortable: true,
            halign: "center",
            align: "center",
        }, {
            field: "name",
            title: "函数名称",
            visible: true,
            sortable: true,
            halign: "center",
            align: "center",
            width: "200px",
        }, {
            field: "type",
            title: "类型",
            visible: true,
            sortable: true,
            halign: "center",
            align: "center",
            formatter: function (value, row, index, field) {
                return value === "alloc" ? "分配" : "释放";
            }
        }, {
            field: "argIdItemSize",
            title: "argid_itemsize",
            visible: true,
            sortable: true,
            halign: "center",
            align: "center",
        }, {
            field: "argIdItemNum",
            title: "argid_itemnum",
            visible: true,
            sortable: true,
            halign: "center",
            align: "center",
        }, {
            field: "argIdPtrIndex",
            title: "argid_ptridx",
            visible: true,
            sortable: true,
            halign: "center",
            align: "center",
        }, {
            field: "isInternal",
            title: "isInternal",
            visible: true,
            sortable: true,
            halign: "center",
            align: "center",
        }, {
            field: "operate",
            title: "操作",
            halign: "center",
            align: "center",
            width: "200px",
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
        };
    };

    // 修改返回的数据格式
    var responseHandlerFun = function (json) {
        if (!Global.checkServerMsg(json)) {
            alert("获取 exps 数据失败！");
            return;
        }
        var total = json["extend"]["pageInfo"]["totalElements"];
        var rows = json["extend"]["pageInfo"]["content"];
        $.each(rows, function (i, row) {
            row.state = $.inArray(row.name, selections) !== -1
        });
        return {
            total: total,
            rows: rows,
        };
    };

    var funcsTableOptions = {
        toolbar: "#SET_FuncsToolbar",
        locale: "zh-CN",
        classes:"table table-striped table-bordered table-sm table-hover table-advance",
        columns: columns,
        data: [],
        showColumns: true,
        // height: 570,
        sortName: "name",
        // search: true,
        striped: true,
        showToggle: true,
        showRefresh: true,
        // showExport: true, //是否显示导出按钮
        // exportDataType: 'all',
        uniqueId: "id",
        // clickToSelect: true, // 设置 true 将在点击行时，自动选择 rediobox 和 checkbox。
        // checkboxHeader: false, // 设置 false 将在列头隐藏全选复选框。
        // 分页参数
        method: "get", // get方式提交
        url: "func/all", // 获取数据
        pagination: true, // 显示分页条
        sidePagination: 'server', // 在服务器端分页
        pageNumber: 1, // 初始化展示第一页
        pageSize: 10, // 每页 10 条数据
        pageList: [10, 25, 50, 100, "ALL"],
        queryParamsType: "limit", // 使用RESTFul格式的参数 可以不写 默认就是limit
        queryParams: queryParamsFunc, // 向后台传的参数
        responseHandler: responseHandlerFun, // 修改返回的数据格式
    };

    var funcsTableInit = function () {
        $funcsTable.bootstrapTable("destroy").bootstrapTable(funcsTableOptions);
        $funcsTable.on('check.bs.table uncheck.bs.table ' + 'check-all.bs.table uncheck-all.bs.table', function () {
            $funcRemoveBtn.prop('disabled', !$funcsTable.bootstrapTable('getSelections').length)
            selections = getIdSelections();
        });
        $funcRemoveBtn.click(function () {
            var ids = getIdSelections();
            $.post("func/deleteByIds", {ids: ids.join(",")}, function (msg) {
                if (Global.checkServerMsg(msg)) {
                    $funcsTable.bootstrapTable("refresh");
                    $funcRemoveBtn.prop('disabled', true);
                } else {
                    alert("删除失败！");
                }
            });
        });
        $addBtnInAddModal.click(function () {
            $.post("func/add", $addModal.find("form").eq(0).serialize(), function (msg) {
                if (Global.checkServerMsg(msg)) {
                    $addModal.modal("hide");
                    $funcsTable.bootstrapTable("refresh");
                } else {
                    alert("添加失败！");
                }
            });
        });
        $saveBtnInEditModal.click(function () {
            $.post("func/post", $editModal.find("form").eq(0).serialize(), function (msg) {
                if (Global.checkServerMsg(msg)) {
                    $editModal.modal("hide");
                    $funcsTable.bootstrapTable("refresh");
                } else {
                    alert("修改失败！");
                }
            });
        });
    };

    function getIdSelections() {
        return $.map($funcsTable.bootstrapTable('getSelections'), function (row) {
            return row.id
        })
    }

    return {
        init: function () {
            funcsTableInit();
        }
    }
}();

jQuery(document).ready(function () {
    Settings.init(); // init metronic core componets
});