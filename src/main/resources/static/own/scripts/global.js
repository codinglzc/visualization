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
        ms = ms / 1000;
        var days = parseInt(ms / (1000 * 60 * 60 * 24));
        var hours = parseInt((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = parseInt((ms % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = parseInt((ms % (1000 * 60)) / 1000);
        var rs = "";
        if (days !== 0) rs += days + " 天 ";
        if (hours !== 0) rs += hours + " 小时 ";
        if (minutes !== 0) rs += minutes + " 分钟 ";
        if (seconds !== 0) rs += seconds + " 秒 ";
        return rs;
    };

    return {
        init: function () {
            terminalUrlInit();
        },
        checkServerMsg: checkServerMsg,
        getTimeStrFromMicrosecond: getTimeStrFromMicrosecond,
        getMicrosecondFromTimeStr: getMicrosecondFromTimeStr,
        formatTime: formatTime
    }
}();

jQuery(document).ready(function () {
    Global.init(); // init metronic core componets
});