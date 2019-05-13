/**
 * 每个页面都需要的全局配置
 */
var Global = function () {

    var terminalUrlInit = function () {
        $.get("/properties/gateoneUrl", function (data) {
            if (!checkServerMsg(data)) {
                alert("GET请求出错: /properties/gateoneUrl");
            }
            $(".fa-terminal").parent('a').prop({href: data["extend"]["gateoneUrl"]});
        });
    };

    var checkServerMsg = function (data) {
        return data["code"] === 100 && data["message"] === "success";
    };

    /**
     * 时间戳转换日期
     * @param microseconds  待时间戳(毫秒)
     * @param isFull  返回完整时间(Y-m-d 或者 Y-m-d H:i:s)
     * @param timeZone  时区
     */
    var getTimeStrFromMicrosecond = function (microseconds, isFull, timeZone) {
        if (typeof (timeZone) === 'number') {
            microseconds = parseInt(microseconds) - parseInt(timeZone) * 60 * 60 * 1000;
        }
        var time = new Date(microseconds);
        var ymdhis = "";
        ymdhis += time.getFullYear() + "-";
        ymdhis += ((time.getMonth() + 1) < 10 ? "0" + (time.getMonth() + 1) : (time.getMonth() + 1)) + "-";
        ymdhis += (time.getDate() < 10 ? "0" + time.getDate() : time.getDate()) + " ";
        if (isFull === true) {
            ymdhis += (time.getHours() < 10 ? "0" + time.getHours() : time.getHours()) + ":";
            ymdhis += (time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes()) + ":";
            ymdhis += (time.getSeconds() < 10 ? "0" + time.getSeconds() : time.getSeconds());
        }
        return ymdhis;
    };

    /**
     * 日期 转换为 Unix时间戳
     * @param timeStr 2014-01-01 20:20:20 日期格式
     * @return number
     */
    var getMicrosecondFromTimeStr = function (timeStr) {
        var f = timeStr.split(' ', 2);
        var d = (f[0] ? f[0] : '').split('-', 3);
        var t = (f[1] ? f[1] : '').split(':', 3);
        return (new Date(
            parseInt(d[0], 10) || null,
            (parseInt(d[1], 10) || 1) - 1,
            parseInt(d[2], 10) || null,
            parseInt(t[0], 10) || null,
            parseInt(t[1], 10) || null,
            parseInt(t[2], 10) || null
        )).getTime();
    };

    /**
     * 微妙转成 天/时/分/秒
     * @param ms 微妙
     * @returns {string}
     */
    var formatTime = function (ms) {
        ms = parseInt(ms / 1000);
        // var days = parseInt(ms / (1000 * 60 * 60 * 24));
        var hours = parseInt((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = parseInt((ms % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = parseInt((ms % (1000 * 60)) / 1000);
        var rs = "";
        // if (days !== 0) rs += days + " 天 ";
        if (hours !== 0) rs += hours + " 小时 ";
        if (minutes !== 0) rs += minutes + " 分钟 ";
        if (seconds !== 0) rs += seconds + " 秒 ";
        if (hours === 0 && minutes === 0 && seconds === 0)
            return "0 秒";
        return rs;
    };

    /**
     * 获取当前正在运行的实验个数
     * @returns {number}
     */
    var getCurrentExpNum = function () {
        var currentExpNum = 1;
        $.ajax({
            url: "exp/getCurrentExpNum",
            data: {},
            type: "GET",
            dataType: "json",
            async: false,
            success: function (result) {
                if (Global.checkServerMsg(result)) {
                    currentExpNum = result['extend']['currentExpNum'];
                } else {
                    alert("获取当前正在运行的实验个数失败！");
                }
            }
        });
        return currentExpNum;
    };

    var _isNVM = function (varName, sourceCodeInfo) {
        if (sourceCodeInfo.indexOf("main") === -1)
            return false;
        if (varName === "double*xx")
            return true;
        else if (varName === "int64_t*bfs_roots")
            return true;
        else if (varName === "packed_edge*buf")
            return true;
        else if (varName === "double*edge_counts")
            return true;
        else if (varName === "double*bfs_times")
            return true;
        else if (varName === "double*validate_times")
            return true;
        else if (varName === "double*secs_per_edge")
            return true;
        return false;
    };

    var getAllocType = function (varName, oldType, sourceCodeInfo) {
        if (_isNVM(varName, sourceCodeInfo)) return "NVM";
        else if (oldType === "Heap") return "DRAM";
        return oldType;
    };

    var getAllocFunction = function (varName, oldFun, sourceCodeInfo) {
        return _isNVM(varName, sourceCodeInfo) ? "DYMalloc" : oldFun;
    };

    var formatSize = function (size) {
        var unit = "Byte";
        while (size >= 1024 && unit !== "GB") {
            size /= 1024.0;
            if (unit === "Byte")
                unit = "KB";
            else if (unit === "KB") {
                unit = "MB"
            } else if (unit === "MB") {
                unit = "GB";
            }
        }
        return size.toFixed(2) + " " + unit;
    };

    return {
        init: function () {
            terminalUrlInit();
        },
        checkServerMsg: checkServerMsg,
        getTimeStrFromMicrosecond: getTimeStrFromMicrosecond,
        getMicrosecondFromTimeStr: getMicrosecondFromTimeStr,
        formatTime: formatTime,
        getCurrentExpNum: getCurrentExpNum,
        getAllocType: getAllocType,
        getAllocFunction: getAllocFunction,
        formatSize: formatSize,
    }
}();

jQuery(document).ready(function () {
    Global.init(); // init metronic core componets
});