import ui from "../soonui";
import { text, append, remove, css, addClass, removeClass, hasClass, createElement, prop } from "../common/html/html-utils";

function initTitle(titleText) {
    let title = document.getElementsByTagName("title");
    if(title.length === 0) {
        title = createElement("title");
        text(title, titleText);
        let head = document.getElementsByTagName("head")[0];
        append(head, title);
    } else {
        text(title[0], titleText);
    }
}

function loadCss(cssUrl) {
    const head = document.getElementsByTagName("head")[0];
    let cssUrlArray = null;
    if(Array.isArray(cssUrl)) {
        cssUrlArray = cssUrl;
    } else {
        cssUrlArray = [cssUrl];
    }

    cssUrlArray.forEach(item => {
        if(!item) {
            return;
        }

        const linkElem = createElement("link");
        prop(linkElem, {
            type: "text/css",
            rel: "stylesheet"
        })
        if(typeof item === "string") {
            prop(linkElem, {
                "href": item
            });
        } else {
            prop(linkElem, item);
        }
        append(head, linkElem);
    });
}

function masterLoaded() {
    let pageProgress = document.getElementsByClassName("page-progress");
    if(pageProgress.length > 0) {
        pageProgress = pageProgress[0];
        remove(pageProgress);
    }

    css(ui.page.body, {
        visibility: "visible",
        opacity: 0
    });
    ui.animator.fadeIn(ui.page.body, 500);

    ui.ajax.global.start(function() {
        ui.loadingShow();
    });
    ui.ajax.global.complete(function() {
        ui.loadingHide();
    });
}

function toolButtonClickHandler(li, a, buttonSettings, toolPanelResizeHandlers) {
    if(buttonSettings.toggle) {
        return e => {
            e.stopPropagation();
            const checked = !hasClass(a, "map-button-active");
            if(checked) {
                addClass(a, "map-button-active");
            } else {
                removeClass(a, "map-button-active");
            }

            buttonSettings.handler.call(null, checked, (toolPanel) => {
                const id = buttonSettings.id;
                if(checked) {
                    let rect = a.getBoundingClientRect();
                    const location = {
                        top: rect.top,
                        left: rect.left
                    };
                    toolPanel.show(location);
                    if(id) {
                        if(!toolPanelResizeHandlers.containsKey(id)) {
                            toolPanelResizeHandlers.set(id, () => {
                                if(toolPanel.isShow()) {
                                    let rect = a.getBoundingClientRect();
                                    const location = {
                                        top: rect.top,
                                        left: rect.left
                                    };
                                    toolPanel.show(location);
                                }
                            });
                        }
                    }
                } else {
                    if(id) {
                        toolPanelResizeHandlers.set(id, null);
                    }
                    toolPanel.hide();
                }
            });
        };
    } else if(buttonSettings.change) {
        let change = buttonSettings.change;
        if(Array.isArray(change)) {
            return e => {
                e.stopPropagation();
                let icon = a.getElementsByTagName("i");
                if(icon.length === 0) {
                    return;
                }

                icon = icon[0];
                const states = change;
                let state = -1;

                for(let i = 0; i < states.length; i++) {
                    if(hasClass(icon, states[i])) {
                        removeClass(icon, states[i]);
                        state = i;
                        break;
                    }
                }

                if(state > -1) {
                    state++;
                    if(state >= states.length) {
                        state = 0;
                    }
                    addClass(icon, states[state]);
                    buttonSettings.handler.call(null, state);
                }
            };
        }

        if(ui.core.isFunction(change)) {
            return e => {
                e.stopPropagation();
                change.call(null, e, handler);
            };
        }

        throw new TypeError("no support change model.");
    } else {
        return e => {
            e.stopPropagation();
            buttonSettings.handler.call(null, e);
        };
    }
}

export {
    initTitle,
    masterLoaded,
    toolButtonClickHandler,
    loadCss
};