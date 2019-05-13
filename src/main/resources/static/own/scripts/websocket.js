/**
 * <p>
 * Web Socket
 *
 * Note：如果要添加监听事件，则必须在 init() 函数之前调用。
 * </p>
 *
 * @author Liu Cong
 * @since 2018/12/5
 */
var Websocket = function () {

    // var ip = "localhost";
    // var ip = "202.114.6.55";
    // var port = "8080";
    var host = window.location.host;
    var wsurl = "ws://" + host + "/websocket";
    var sjurl = "http://" + host + "/sockjs/websocket";

    var socket;

    var _onMsgListenMap = {};      // 接收消息时的触发事件
    var _onOpenListenMap = {};     // websocket 成功连接时的触发事件
    var _onErrorListenMap = {};    // websocket 发生错误时的触发事件
    var _oncloseListenMap = {};    // websocket 关闭时的触发事件

    /**
     * 初始化
     */
    var init = function () {
        // 创建 socket 并连接
        if ('WebSocket' in window) {
            socket = new WebSocket(wsurl);
        } else {
            socket = new SockJS(sjurl);
        }

        // 默认的 onopen, onmessage, onerror 和 onclose 触发函数
        _addAllDefaultListens();

        // flush all listens
        flushAllListens();
    };
    /**
     * 发送消息，msg将会被转成 JSON 再发送
     * @param msg 消息
     */
    var sendMsg = function (msg) {
        socket.send(JSON.stringify(msg));
    };

    /**
     * 返回当前 WebSocket 的链接状态，只读。
     * 0 (CONNECTING)
     *      正在链接中
     * 1 (OPEN)
     *      已经链接并且可以通讯
     * 2 (CLOSING)
     *      连接正在关闭
     * 3 (CLOSED)
     *      连接已关闭或者没有链接成功
     *
     * @returns {number}
     */
    var getReadyState = function () {
        return socket.readyState;
    };


    // ================= Begin Add Listen (public) ====================//
    /**
     * 添加 onopen 的触发事件
     * Note：必须在 init() 函数之前调用
     * @param id 事件id，具有唯一性
     * @param func 事件函数
     * @param isOverwrite 是否覆盖原有函数
     */
    var addOnOpenListen = function (id, func, isOverwrite) {
        // 如果 func 参数为 undefined 或 null，则意味什么都不做
        if (func === undefined || func === null) {
            func = function (event) {
            };
            return;
        }
        // 如果 func 的类型不为 function，则抛出异常。
        if (typeof func !== "function") {
            throw "函数 addOnOpenListen 的 func 参数的类型不正确！";
        }
        // 添加接收消息触发函数到 _onOpenListenMap
        if (isOverwrite === undefined || isOverwrite === null)
            isOverwrite = true;
        if (isOverwrite || _onOpenListenMap[id] === undefined) {
            _onOpenListenMap[id] = func;
        }
    };

    /**
     * 添加接收消息时的触发事件
     * Note：必须在 init() 函数之前调用
     * @param id 事件id，具有唯一性
     * @param func 事件函数
     * @param isOverwrite 是否覆盖原有函数
     */
    var addOnMsgListen = function (id, func, isOverwrite) {
        // 如果 func 参数为 undefined 或 null，则意味什么都不做
        if (func === undefined || func === null) {
            func = function (event) {
            };
            return;
        }
        // 如果 func 的类型不为 function，则抛出异常。
        if (typeof func !== "function") {
            throw "函数 addOnMsgListen 的 func 参数的类型不正确！";
        }
        // 添加接收消息触发函数到 _onMsgListenMap
        if (isOverwrite === undefined || isOverwrite === null)
            isOverwrite = true;
        if (isOverwrite || _onMsgListenMap[id] === undefined) {
            _onMsgListenMap[id] = func;
        }
    };

    /**
     * 添加 onerror 的触发事件
     * Note：必须在 init() 函数之前调用
     * @param id 事件id，具有唯一性
     * @param func 事件函数
     * @param isOverwrite 是否覆盖原有函数
     */
    var addOnErrorListen = function (id, func, isOverwrite) {
        // 如果 func 参数为 undefined 或 null，则意味什么都不做
        if (func === undefined || func === null) {
            func = function (event) {
            };
            return;
        }
        // 如果 func 的类型不为 function，则抛出异常。
        if (typeof func !== "function") {
            throw "函数 addOnErrorListen 的 func 参数的类型不正确！";
        }
        // 添加接收消息触发函数到 _onErrorListenMap
        if (isOverwrite === undefined || isOverwrite === null)
            isOverwrite = true;
        if (isOverwrite || _onErrorListenMap[id] === undefined) {
            _onErrorListenMap[id] = func;
        }
    };

    /**
     * 添加 onclose 的触发事件
     * Note：必须在 init() 函数之前调用
     * @param id 事件id，具有唯一性
     * @param func 事件函数
     * @param isOverwrite 是否覆盖原有函数
     */
    var addOnCloseListen = function (id, func, isOverwrite) {
        // 如果 func 参数为 undefined 或 null，则意味什么都不做
        if (func === undefined || func === null) {
            func = function (event) {
            };
            return;
        }
        // 如果 func 的类型不为 function，则抛出异常。
        if (typeof func !== "function") {
            throw "函数 addOnCloseListen 的 func 参数的类型不正确！";
        }
        // 添加接收消息触发函数到 _oncloseListenMap
        if (isOverwrite === undefined || isOverwrite === null)
            isOverwrite = true;
        if (isOverwrite || _oncloseListenMap[id] === undefined) {
            _oncloseListenMap[id] = func;
        }
    };

    // ================= End Add Listen (public) ====================//

    // ================= Begin Add Listen (private) ====================//
    /**
     * 默认设置：onopen
     * @private
     */
    var _addDefaulOnOpenListen = function () {
        _onOpenListenMap["default"] = function (event) {
            console.log("  web.onopen  ");
        };
    };

    /**
     * 默认设置：消息处理函数
     * @private
     */
    var _addDefaulOnMsgListen = function () {
        _onMsgListenMap["default"] = function (event) {
            console.log("  web.onmessage   ");
        };
    };

    /**
     * 默认设置：onerror
     * @private
     */
    var _addDefaulOnErrorListen = function () {
        _onErrorListenMap["default"] = function (event) {
            console.log("  web.error  ");
        };
    };

    /**
     * 默认设置：onclose
     * @private
     */
    var _addDefaulOnCloseListen = function () {
        _oncloseListenMap["default"] = function (event) {
            console.log("  web.close  ");
        };
    };

    /**
     * 添加默认设置：onopen, onmessage, oneroor 和 onclose.
     * @private
     */
    var _addAllDefaultListens = function () {
        _addDefaulOnOpenListen();
        _addDefaulOnMsgListen();
        _addDefaulOnErrorListen();
        _addDefaulOnCloseListen();
    };

    // ================= End Add Listen (private) ====================//

    // ================= Begin Flush Listen (private) ====================//
    /**
     * 刷新 onopen 事件
     */
    var flushOnOpenListenMap = function () {
        socket.onopen = function (event) {
            for (var key in _onOpenListenMap) {
                if (_onOpenListenMap.hasOwnProperty(key)) {
                    var func = _onOpenListenMap[key];

                    // 调用 触发函数
                    func(event);
                }
            }
        };
    };

    /**
     * 刷新 onmessage 事件
     */
    var flushOnMsgListenMap = function () {
        socket.onmessage = function (event) {
            for (var key in _onMsgListenMap) {
                if (_onMsgListenMap.hasOwnProperty(key)) {
                    var func = _onMsgListenMap[key];

                    // 调用 触发函数
                    func(event);
                }
            }
        };
    };

    /**
     * 刷新 onerror 事件
     */
    var flushOnErrorListenMap = function () {
        socket.onerror = function (event) {
            for (var key in _onErrorListenMap) {
                if (_onErrorListenMap.hasOwnProperty(key)) {
                    var func = _onErrorListenMap[key];

                    // 调用 触发函数
                    func(event);
                }
            }
        };
    };

    /**
     * 刷新 onerror 事件
     */
    var flushOnCloseListenMap = function () {
        socket.onclose = function (event) {
            for (var key in _oncloseListenMap) {
                if (_oncloseListenMap.hasOwnProperty(key)) {
                    var func = _oncloseListenMap[key];

                    // 调用 触发函数
                    func(event);
                }
            }
        };
    };

    /**
     * 刷新所有的事件监听
     */
    var flushAllListens = function () {
        flushOnOpenListenMap();
        flushOnMsgListenMap();
        flushOnCloseListenMap();
        flushOnErrorListenMap();
    };

    // ================= End Flush Listen (private) ====================//


    /**
     * 清空字典
     * @param map
     * @private
     */
    var _clearMap = function (map) {
        for (var key in map) {
            if (map.hasOwnProperty(key)) {
                delete map[key];
            }
        }
    };

    return {
        init: init,
        sendMsg: sendMsg,
        getReadyState: getReadyState,

        addOnOpenListen: addOnOpenListen,
        addOnMsgListen: addOnMsgListen,
        addOnErrorListen: addOnErrorListen,
        addOnCloseListen: addOnCloseListen,

        flushOnOpenListenMap: flushOnOpenListenMap,
        flushOnMsgListenMap: flushOnMsgListenMap,
        flushOnCloseListenMap: flushOnCloseListenMap,
        flushOnErrorListenMap: flushOnErrorListenMap,
        flushAllListens: flushAllListens
    }

}();