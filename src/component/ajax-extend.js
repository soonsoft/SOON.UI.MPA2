import ui from "../soonui";

const formContent = "application/x-www-form-urlencoded; charset=UTF-8";
const jsonContent = "application/json; charset=utf-8";
const fileContent = "multipart/form-data";

const sessionIdHeader = "X-AUTH-URANUS-SID";
const _rhtml = /<(\S*?)[^>]*>.*?<\/\1>|<.*? \/>/i;

function unauthorized(ajaxRequest, context) {
    if(ajaxRequest.status === 401) {
        return unauthorizedHandler(context);
    } else if(ajaxRequest.status === 403) {
        return forbiddenHandler(context);
    }
    return true;
}

function unauthorizedHandler(context) {
    alert("由于您长时间未操作，需要重新登录");
    location.href = "/login.html";
    return false;
}

function forbiddenHandler(context) {
    const error = {
        message: "您没有权限执行此操作，请更换用户重新登录或联系系统管理员。"
    };
    if(context && context.errorFn) {
        context.errorFn(error);
    }
    return false;
}

function successHandler(context, data, textStatus, ajaxRequest) {
    const result = unauthorized(ajaxRequest, context);
    if(result === false) {
        return;
    }
    context.successFn(data, ajaxRequest, textStatus);
}

function errorHandler(context, ajaxRequest, textStatus, errorThrown) {
    let result = unauthorized(ajaxRequest, context);
    if(result === false) {
        return;
    }
    if(textStatus === "parsererror") {
        context.error.message = "没能获取预期的数据类型，转换json发生错误";
        context.error.responseText = ajaxRequest.responseText;
    } else {
        try {
            result = JSON.parse(ajaxRequest.responseText);
            context.error.message = result.message || result.Message || "Unknown Error";
        } catch(e) {
            context.error.message = ajaxRequest.responseText;
        }
    }
    context.errorFn(context.error,);
}

function ajaxCall(method, url, args, successFn, errorFn, option) {
    if (ui.core.isFunction(args)) {
        errorFn = successFn;
        successFn = args;
        args = null;
    }

    if(ui.core.isPlainObject(errorFn)) {
        option = errorFn;
        errorFn = null;
    }

    let ajaxOption = {
        type: method.toUpperCase() === "GET" ? "GET" : "POST",
        dataType: "json",
        url: url,
        async: true,
        // 如果是生产环境，则需要设置一个超时时间
        timeout: 0,
        data: args
    };
    const context = {
        error: {}
    };

    if (option) {
        ajaxOption = ui.extend(ajaxOption, option);
    }
    if(ajaxOption.type === "POST" && !ajaxOption.contentType) {
        ajaxOption.contentType = "application/json; charset=utf-8";
    }

    if (ui.core.isFunction(successFn)) {
        context.successFn = successFn;
        ajaxOption.success = function(ajaxResult) {
            successHandler(context, ajaxResult.response, ajaxResult.statusText, ajaxResult.ajaxRequest);
        };
    }
    if (ui.core.isFunction(errorFn)) {
        context.errorFn = errorFn;
    } else {
        context.errorFn = defaultErrorHandler;
    }
    ajaxOption.error = function(ajaxError) {
        if(ajaxError instanceof Error) {
            context.errorFn(ajaxError);
        } else {
            errorHandler(context, ajaxError.ajaxRequest, ajaxError.statusText, ajaxError.error);
        }
    };
    return ui.ajax(ajaxOption);
}

function defaultErrorHandler(e) {
    const message = (e ? e.message || e.Message : null) || "处理当前请求时遇到错误。";
    ui.errorShow(message);
}

function getUrl(baseUrl, url) {
    if(!baseUrl) {
        return url;
    }

    if(!baseUrl.endsWith("/") && !url.startsWith("/")) {
        return baseUrl + "/" + url;
    }

    return baseUrl + url;
}

function setSessionHeader(request, option) {
    let headers = option.headers;
    if(!headers) {
        headers = option.headers = {};
    }

    let sessionId = request.sessionId;
    if(!sessionId) {
        sessionId = ui.cookie.get(sessionIdHeader);
    }

    if(sessionId) {
        request.sessionId = sessionId;
        headers[sessionIdHeader] = sessionId;
    }
}

function isPromise(promise) {
    return promise && ui.core.isFunction(promise.then);
}

/**
 * HttpRequest Method方式共有15种
 * Get URL传参
 * Head 没有ResponseBody，用于获取ResponseHead
 * Post ReqeustBody提交数据
 * Put 将客户端的数据发送到服务器上取代文档内容
 * Delete 删除服务器上的文件
 * Connect
 * Options
 * Trace
 * Patch
 * Move
 * Copy
 * Link
 * Unlink
 * Wrapped
 * Extension-method
 */
class AjaxRequest {

    constructor(option) {
        this.baseUrl = option.baseUrl || "";
        this.isAuth = !!option.isAuth;
    }

    _ensureOption(option, contentType) {
        if(!option) option = {};
        option.contentType = contentType;
        if(this.isAuth) {
            setSessionHeader(this, option);
        }
        return option;
    }

    login(url, username, password, success) {
        return this.post(
            url, 
            {
                username: username,
                password: password
            },
            result => {
                let sessionId = result.token;
                if(sessionId) {
                    this.sessionId = sessionId;
                    ui.cookie.set(sessionIdHeader, sessionId);
                }
                if(ui.core.isFunction(success)) {
                    success(result);
                }
            },
            e => {
                ui.errorShow("用户名或密码错误");
            }
        );
    }

    logout(url) {
        return this.get(url, result => {
            this.sessionId = null;
            ui.cookie.remove(sessionIdHeader);
        });
    }

    /** get方式 */
    get(url, params, success, failure, option) {
        return ajaxCall("GET", getUrl(this.baseUrl, url), params, success, failure, this._ensureOption(option, formContent));
    }

    /** post方式 */
    post(url, params, success, failure, option) {
        return ajaxCall("POST", getUrl(this.baseUrl, url), params, success, failure, this._ensureOption(option, formContent));
    }

    /** post方式，提交数据为为Json格式 */
    postJson(url, params, success, failure, option) {
        return ajaxCall("POST", getUrl(this.baseUrl, url), params, success, failure, this._ensureOption(option, jsonContent));
    }

    /** put方式 */
    put(url, params, success, failure, option) {
        return ajaxCall("PUT", getUrl(this.baseUrl, url), params, success, failure, this._ensureOption(option, formContent));
    }

    /** put方式，提交数据为为Json格式 */
    putJson(url, params, success, failure, option) {
        return ajaxCall("PUT", getUrl(this.baseUrl, url), params, success, failure, this._ensureOption(option, jsonContent));
    }

    /** delete方式 */
    delete(url, params, success, failure, option) {
        return ajaxCall("DELETE", getUrl(this.baseUrl, url), params, success, failure, this._ensureOption(option, formContent));
    }

    /** delete方式，提交数据为为Json格式 */
    deleteJson(url, params, success, failure, option) {
        return ajaxCall("DELETE", getUrl(this.baseUrl, url), params, success, failure, this._ensureOption(option, jsonContent));
    }

    all() {
        let promises;
        if (arguments.length == 1) {
            if(Array.isArray(arguments[0])) {
                promises = arguments[0];
            } else {
                promises = [arguments[0]];
            }
        } else if (arguments.length > 1) {
            promises = [].slice.call(arguments, 0);
        } else {
            return;
        }

        promises.forEach(p => {
            if(!isPromise(p)) {
                throw new TypeError("the arguments must be Promise.");
            }
        });

        let promise = Promise.all(promises);
        promise._then_old = promise.then;

        promise.then = function (resolve, reject) {
            if (ui.core.isFunction(reject)) {
                let context = {
                    error: {},
                    errorFn: reject
                };
                reject = function(xhr) {
                    errorHandler(context, xhr);
                };
            }
            return this._then_old.call(this, resolve, reject);
        };
        return promise;
    }

}

function createAjaxRequest(option) {
    return new AjaxRequest(option);
}

export {
    createAjaxRequest
};