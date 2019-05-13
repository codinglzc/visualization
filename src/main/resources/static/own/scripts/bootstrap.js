var Bootstrap = function () {

    var form = $('#BS_SubmitForm');
    var error = $('.alert-danger', form);
    var success = $('.alert-success', form);
    var funcs = [];

    var formValidateInit = function () {
        form.validate({
            doNotHideMessage: true, //this option enables to show the error/success messages on tab switch.
            errorElement: 'span', //default input error message container
            errorClass: 'help-block help-block-error', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            rules: {
                // ssh
                profiler_ip: {
                    required: true
                },
                profiler_port: {
                    required: true,
                    digits: true,
                    minlength: 1,
                    maxlength: 5,
                },
                profiler_username: {
                    required: true
                },
                profiler_password: {
                    required: true
                },
                // pintool
                pin_tool: {
                    required: true
                },
                pin_tool_compile: {
                    required: true
                },
                // apps
                apps_base: {
                    required: true
                },
                app: {
                    required: true
                },
                pin_tool_compile: {
                    required: true
                },
                // script
                script_cacheline_bits: {
                    required: true,
                    digits: true,
                    minlength: 1,
                    maxlength: 1,
                },
                script_threshold_size: {
                    required: true,
                    digits: true,
                },
                script_socket_server_ip: {
                    required: true
                },
                script_socket_server_port: {
                    required: true,
                    digits: true,
                    minlength: 1,
                    maxlength: 5,
                },
                script_socket_server_interval: {
                    required: true,
                    digits: true,
                },
            },

            messages: { // custom messages for radio buttons and checkboxes
                'payment[]':
                    {
                        required: "Please select at least one option",
                        minlength:
                            jQuery.validator.format("Please select at least one option")
                    }
            },

            errorPlacement: function (error, element) { // render error placement for each input type
                error.insertAfter(element); // for other inputs, just perform default behavior
            },

            invalidHandler: function (event, validator) { //display error alert on form submit
                success.hide();
                error.show();
                App.scrollTo(error, -200);
            },

            highlight: function (element) { // hightlight error inputs
                $(element)
                    .closest('.form-group').removeClass('has-success').addClass('has-error'); // set error class to the control group
            },

            unhighlight: function (element) { // revert the change done by hightlight
                $(element)
                    .closest('.form-group').removeClass('has-error'); // set error class to the control group
            },

            success: function (label) {
                if (label.attr("for") === "gender" || label.attr("for") === "payment[]") { // for checkboxes and radio buttons, no need to show OK icon
                    label
                        .closest('.form-group').removeClass('has-error').addClass('has-success');
                    label.remove(); // remove error label here
                } else { // display success icon for other inputs
                    label
                        .addClass('valid') // mark the current input as valid and display OK icon
                        .closest('.form-group').removeClass('has-error').addClass('has-success'); // set success class to the control group
                }
            },

            submitHandler: function (form) {
                success.show();
                error.hide();
                //add here some ajax code to submit your form or just call form.submit() if you want to submit the form without ajax
            }

        })
        ;
    };

    var handleTitle = function (tab, navigation, index) {
        var total = navigation.find('li').length;
        var current = index + 1;
        // set wizard title
        $('.step-title', $('#form_wizard_1')).text('Step ' + (index + 1) + ' of ' + total);
        // set done steps
        jQuery('li', $('#form_wizard_1')).removeClass("done");
        var li_list = navigation.find('li');
        for (var i = 0; i < index; i++) {
            jQuery(li_list[i]).addClass("done");
        }

        if (current === 1) {
            $('#form_wizard_1').find('.button-previous').hide();
        } else {
            $('#form_wizard_1').find('.button-previous').show();
        }

        if (current >= total) {
            $('#form_wizard_1').find('.button-next').hide();
            $('#form_wizard_1').find('.button-submit').show();
        } else {
            $('#form_wizard_1').find('.button-next').show();
            $('#form_wizard_1').find('.button-submit').hide();
        }
        App.scrollTo($('.page-title'));
    };

    var sendSshProperty = function () {
        var flag = false;
        $.ajax({
            url: "shell/setSsh",
            data: {
                ip: $('#BS_ProfilerIP').val(),
                port: $('#BS_ProfilerPort').val(),
                username: $('#BS_Username').val(),
                password: $('#BS_Password').val()
            },
            type: "POST",
            dataType: "json",
            async: false,
            success: function (result) {
                flag = Global.checkServerMsg(result);
            }
        });
        return flag;
    };

    var pinToolCompile = function () {
        var command = $('#BS_PinToolCompile').val();
        $.post("shell/cmd", {command: command}, function (data) {
            // console.log(data);
            if (data["code"] === 0) {
                $('#BS_PinToolCompileSuccess').show();
                $('#BS_PinToolCompileFailed').hide();
                $('#BS_PinToolCompileBtn').data("compile", "true");
            } else {
                $('#BS_PinToolCompileFailed').show();
                $('#BS_PinToolCompileSuccess').hide();
                $('#BS_PinToolCompileBtn').data("compile", "false");
            }
        });
    };

    var appCompile = function () {
        var command = $('#BS_AppCompile').val();
        $.post("shell/cmd", {command: command}, function (data) {
            // console.log(data);
            if (data["code"] === 0) {
                $('#BS_AppCompileSuccess').show();
                $('#BS_AppCompileFailed').hide();
                $('#BS_AppCompileBtn').data("compile", "true");
            } else {
                $('#BS_AppCompileFailed').show();
                $('#BS_AppCompileSuccess').hide();
                $('#BS_AppCompileBtn').data("compile", "false");
            }
        });
    };

    var updateAppsSelect = function () {
        $("#BS_App").empty();
        var command = "ls " + $('#BS_PinToolBase').val() + "/apps";
        $.post("shell/cmd", {command: command}, function (data) {
            if (data["code"] === 0) {
                for (var i in data["stdout"]) {
                    var name = data["stdout"][i];
                    if (name === "scripts")
                        continue;
                    if (name === "test") // 测试程序
                        $("#BS_App").append("<option value='" + name + "'>" + name + "</option>");
                    else if (name === "graph500")
                        $("#BS_App").append("<option value='" + name + "'>" + name + "</option>");
                }
                if ($("#BS_App").val() === "test"){
                    var command = "cd " + $('#BS_AppsBase').val() + "/" + $("#BS_App").val() + " && make all";
                    $('#BS_AppCompile').val(command);
                    $('#BS_ScriptPath').val($('#BS_AppsBase').val() + "/scripts/profiler_" + $("#BS_App").val() + ".sh");
                    $('#BS_ScriptRun').val("cd " + $('#BS_PinToolBase').val() + " && ." + $('#BS_ScriptPath').val().replace($('#BS_PinToolBase').val(), ""));
                }else if ($("#BS_App").val() === "graph500"){
                    var command = "cd " + $('#BS_AppsBase').val() + "/" + $("#BS_App").val() + "/src" + " && make";
                    $('#BS_AppCompile').val(command);
                    $('#BS_ScriptPath').val($('#BS_AppsBase').val() + "/scripts/profiler_" + $("#BS_App").val() + ".sh");
                    $('#BS_ScriptRun').val("cd " + $('#BS_PinToolBase').val() + " && ." + $('#BS_ScriptPath').val().replace($('#BS_PinToolBase').val(), ""));
                }
            } else {
                alert("获取测试程序失败！");
            }
        });
    };

    var becomeDefault = function () {
        $('#BS_PinToolCompileBtn').data("compile", "false");
        $('#BS_PinToolCompileSuccess').hide();
        $('#BS_PinToolCompileFailed').hide();
        $('#BS_AppCompileBtn').data("compile", "false");
        $('#BS_AppCompileSuccess').hide();
        $('#BS_AppCompileFailed').hide();
    };

    var formWizardInit = function () {
        // default form wizard
        $('#form_wizard_1').bootstrapWizard({
            'nextSelector': '.button-next',
            'previousSelector': '.button-previous',
            onTabClick: function (tab, navigation, index, clickedIndex) {
                return false;
            },
            onNext: function (tab, navigation, index) {
                success.hide();
                error.hide();

                if (form.valid() === false) {
                    return false;
                }

                if (index === 1) {
                    if (!sendSshProperty()) {
                        alert("SSH连接失败！");
                        return false;
                    }
                } else if (index === 2) {
                    if ($('#BS_PinToolCompileBtn').data("compile") !== "true") {
                        alert("查看PinTool是否编译成功！");
                        return false;
                    } else {
                        updateAppsSelect();
                    }
                } else if (index === 3) {
                    if ($('#BS_AppCompileBtn').data("compile") !== "true") {
                        alert("查看测试程序是否编译成功！");
                        return false;
                    }
                }

                handleTitle(tab, navigation, index);
            },
            onPrevious: function (tab, navigation, index) {
                success.hide();
                error.hide();

                handleTitle(tab, navigation, index);
            },
            onTabShow: function (tab, navigation, index) {
                var total = navigation.find('li').length;
                var current = index + 1;
                var $percent = (current / total) * 100;
                $('#form_wizard_1').find('.progress-bar').css({
                    width: $percent + '%'
                });
            }
        });

        $('#form_wizard_1').find('.button-previous').hide();
        // 提交按钮
        $('#form_wizard_1 .button-submit').click(function () {
            if (Global.getCurrentExpNum() > 0) {
                alert("已经有实验程序在运行了！");
                return;
            }
            var command = $('#BS_ScriptRun').val();
            var funcsStr = funcs.join(",");
            var data = {
                command: command,
                funcs: funcsStr,
                pintool_base: $('#BS_PinToolBase').val(),
                app_name: $("#BS_App").val(),
                script_cacheline_bits: $('#BS_ScriptCachelineBits').val(),
                script_threshold_size: $('#BS_ScriptThresholdSize').val(),
                script_socket_server_ip: $('#BS_ScriptSocketServerIp').val(),
                script_socket_server_port: $('#BS_ScriptSocketServerPort').val(),
                script_socket_server_interval: $('#BS_ScriptSocketServerInterval').val(),
            };
            $.post("shell/runExp", data, function (data) {
                console.log(data);
            });
        }).hide();

        // 设置input为ip类型
        $('#BS_ProfilerIP').ipAddress();
        $('#BS_ScriptSocketServerIp').ipAddress();

        // 初始化多选框
        $.get("func/allNoPageInfo", function (ret) {
            if (!Global.checkServerMsg(ret)) {
                alert("从数据库中获取内存分配/释放函数失败！");
            } else {
                for (var i in  ret["extend"]["funcs"]) {
                    var func = ret["extend"]["funcs"][i];
                    var $option = $('<option value="' + func['id'] + '">' + func['name'] + '</option>');
                    $('#BS_ScriptFuctions').find('optgroup[label="' + func['type'] + '"]').append($option);
                }
                $("#BS_ScriptFuctions").multiSelect({
                    keepOrder: true,
                    selectableOptgroup: true, // 当点击多选组时，将会移动组里所有元素至对面
                    afterSelect: function (values) {
                        Array.prototype.push.apply(funcs, values);
                    },
                    afterDeselect: function (values) {
                        funcs = $.grep(funcs, function (value) {
                            return $.inArray(value, values) < 0;
                        });
                    }
                });
            }
        });

        // 自动根据$("#BS_PinToolBase").val()填充$("#BS_PinToolCompile").val() 和 $("#BS_AppsBase").val()
        $('#BS_PinToolCompile').val("cd " + $('#BS_PinToolBase').val() + " && make");
        $('#BS_AppsBase').val($('#BS_PinToolBase').val() + "/apps");
        $('#BS_PinToolBase').change(function () {
            var command = "cd " + $(this).val() + " && make";
            $('#BS_PinToolCompile').val(command);
            $('#BS_AppsBase').val($(this).val() + "/apps");
            becomeDefault();
        });
        // 绑定$("#BS_PinToolCompileBtn")点击事件
        $('#BS_PinToolCompileBtn').data("compile", "false");
        $('#BS_PinToolCompileBtn').click(function () {
            pinToolCompile();
        });
        // 当$('#BS_App)改变时，修改编译命令
        $('#BS_App', form).change(function () {
            if ($('#BS_App').val() === "test") {
                var command = "cd " + $('#BS_AppsBase').val() + "/" + $(this).val() + " && make all";
                $('#BS_AppCompile').val(command);
                $('#BS_ScriptPath').val($('#BS_AppsBase').val() + "/scripts/profiler_" + $("#BS_App").val() + ".sh");
                $('#BS_ScriptRun').val("cd " + $('#BS_PinToolBase').val() + " && ." + $('#BS_ScriptPath').val().replace($('#BS_PinToolBase').val(), ""));
            }else if ($("#BS_App").val() === "graph500"){
                var command = "cd " + $('#BS_AppsBase').val() + "/" + $(this).val() + "/src" + " && make";
                $('#BS_AppCompile').val(command);
                $('#BS_ScriptPath').val($('#BS_AppsBase').val() + "/scripts/profiler_" + $("#BS_App").val() + ".sh");
                $('#BS_ScriptRun').val("cd " + $('#BS_PinToolBase').val() + " && ." + $('#BS_ScriptPath').val().replace($('#BS_PinToolBase').val(), ""));
            }
            becomeDefault();
        });
        // 绑定$("#BS_AppCompileBtn")点击事件
        $('#BS_AppCompileBtn').data("compile", "false");
        $('#BS_AppCompileBtn').click(function () {
            appCompile();
        });
    };


    return {
        init: function () {

            formValidateInit();

            formWizardInit();
        }
    }
}();

jQuery(document).ready(function () {
    Bootstrap.init();
});