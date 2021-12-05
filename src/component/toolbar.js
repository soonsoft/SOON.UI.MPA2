import ui from "../soonui";
import { createElement, append, addClass, css, prop, html, on } from "../common/html/html-utils";


function createToolbarBuilder() {
    const toolbarElement = document.createElement("div");
    toolbarElement.classList.add("toolbar", "clear");
    
    return {
        element: toolbarElement,
        addTools
    };
}

/**
 * 添加tools
 * tools: [
 *     { type: "actionButtons", buttons: [ { id: String, text: String, icon: String, handler: function } ] }
 * ]
 * @param {*} tools 设置项
 * @param {*} isRight 
 */
function addTools(tools, isRight) {
    if(!Array.isArray(tools) || tools.length === 0) {
        return;
    }

    let ul = createElement("ul");
    if(isRight) {
        addClass(ul, "tools");
    }
    css(ul, { float: "right" });

    tools.forEach(item => {
        let li = null;
        if(ui.core.isFunction(item)) {
            li = item.call(null);
        } else {
            li = createElement("li");
            if(item.type === "actionButton") {
                addClass(li, "action-buttons");
                createButtons(li, item.buttons);
            }
            // TODO 封装其他对工具方法
        }
        addClass(li, "tool-item");
        append(ul, li);
    });

    append(this.element, ul);
}

function createButtons(li, buttons) {
    if(!Array.isArray(buttons) || buttons.length === 0) {
        return;
    }

    buttons.forEach(b => {
        if(ui.core.isPlainObject(b)) {
            let a = createElement("a");
            addClass(a, "tool-action-button");
            prop(a, "href", "javascript:void(0)");
            if(b.text) {
                prop(a, "title", b.text);
            }
            if(b.id) {
                prop(a, "id", b.id);
            }
            if(b.icon) {
                html(a, b.icon);
            }
            if(ui.core.isFunction(b.handler)) {
                on(a, "click", b.handler);
            }

            append(li, a);
        }
    });
}

export {
    createToolbarBuilder
};
