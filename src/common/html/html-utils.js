import ui from "../../soonui";

const $ = ui.$;
const slice = Array.prototype.slice;

function ensureElement(element) {
    return !element || ui.core.isJQueryObject(element) ? element : $(element);
}

function callFunc(element, fnName, args) {
    let elem = ensureElement(element);
    if(!elem) {
        return undefined;
    }

    const fn = $.fn[fnName];
    if(!ui.core.isFunction(fn)) {
        throw new TypeError("fnName is not defined in $");
    }
    return fn.apply(elem, args);
}

//#region DOM API

function createElement(nodeName) {
    return document.createElement(nodeName);
}

function createElementNS(nodeName) {
    return document.createAttributeNS(nodeName);
}

function before(element) {
    let args = slice.call(arguments, 1);
    callFunc(element, "before", args);
}

function after(element) {
    let args = slice.call(arguments, 1);
    callFunc(element, "after", args);
}

function append(element) {
    let args = slice.call(arguments, 1);
    callFunc(element, "append", args);
}

function remove(element) {
    let args = slice.call(arguments, 1);
    callFunc(element, "remove", args);
}

function replaceWith(element) {
    let args = slice.call(arguments, 1);
    callFunc(element, "replaceWith", args);
}

function empty(element) {
    let args = slice.call(arguments, 1);
    callFunc(element, "empty", args);
}

function text(element) {
    let args = slice.call(arguments, 1);
    return callFunc(element, "text", args);
}

function html(element) {
    let args = slice.call(arguments, 1);
    return callFunc(element, "html", args);
}

function outerHtml(element) {
    let args = slice.call(arguments, 1);
    return callFunc(element, "outerHtml", args);
}

function prop(element) {
    let args = slice.call(arguments, 1);
    return callFunc(element, "prop", args);
}

function attr(element) {
    let args = slice.call(arguments, 1);
    return callFunc(element, "attr", args);
}

function css(element) {
    let args = slice.call(arguments, 1);
    return callFunc(element, "css", args);
}

function addClass(element) {
    let args = slice.call(arguments, 1);
    if(args.length > 1) {
        args = [ args.join(" ") ];
    }
    callFunc(element, "addClass", args);
}

function removeClass(element) {
    let args = slice.call(arguments, 1);
    callFunc(element, "removeClass", args);
}

function getClassList(element) {
    var elem = ensureElement();
    if(!elem) {
        return [];
    }

    return elem[0].classList;
}

function hasClass(element) {
    let args = slice.call(arguments, 1);
    return callFunc(element, "hasClass", args);
}

function toggleClass(element) {
    let args = slice.call(arguments, 1);
    callFunc(element, "toggleClass", args);
}

function on(element) {
    let args = slice.call(arguments, 1);
    callFunc(element, "on", args);
}

function off(element) {
    let args = slice.call(arguments, 1);
    callFunc(element, "off", args);
}

function trigger(element) {
    let args = slice.call(arguments, 1);
    callFunc(element, "trigger", args);
}

function nodeName(element) {
    if(!element) {
        return null;
    }

    return element.nodeName || element.tagName;
}

//#endregion

export {
    createElement,
    createElementNS,
    before,
    after,
    append,
    remove,
    replaceWith,
    empty,
    text,
    html,
    outerHtml,
    prop,
    attr,
    css,
    addClass,
    removeClass,
    getClassList,
    hasClass,
    toggleClass,
    on,
    off,
    trigger,
    nodeName
};