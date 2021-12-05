import ui from "../soonui";
import { createElement, css, text, append, addClass, prop, on, html } from "../common/html/html-utils";
import { initTitle, masterLoaded, toolButtonClickHandler  } from "./common";

ui.theme.currentTheme = "Galaxy";
ui.theme.backgroundColor = "#1A2637";
ui.theme.setHighlight({
    Name: "Galaxy",
    Color: "#00CCCC"
});

const headerHeight = 64;
const $ = ui.$;
const toolPanelResizeHandlers = new ui.KeyArray();

ui.page.get("master").setHandler(function(arg) {
    this.head = $("#head");
    this.body = $("#body");
    
    if(this.head.length > 0) {
        css(this.head, {
            height: headerHeight + "px"
        });
        initHeader(this.head[0], pageSettingsOption.headerWidth, pageSettingsOption.header);
    }
    if(this.body.length > 0) {
        css(this.body, {
            top: headerHeight + "px",
            position: "absolute"
        })
    }

    // 修正布局高度，内容区域满屏
    const layoutSize = () => {
        this.contentBodyHeight = document.documentElement.clientHeight - headerHeight;
        this.contentBodyWidth = document.documentElement.clientWidth;
        css(this.body, {
            height: this.contentBodyHeight + "px"
        });
    };
    layoutSize();
    this.resize(layoutSize, ui.eventPriority.bodyResize);

    if(ui.core.isFunction(arg)) {
        arg.call(this);
    }
});

let pageSettingsOption = {
    title: "TITLE",
    header: "HEADER",
    headerWidth: 450,
    leftIconButtons: [],
    rightIconButtons: []
};

const masterInitConfig = {
    master() {
        this.mapButtonActive = "map-button-active";
        this.panelMarginValue = 10;
        this.headerHeight = headerHeight;

        // 注册loaded事件
        this.loaded(() => {
            masterLoaded();
        });

        // 添加主题Tag颜色 
        ui.ctrls.Tag.addColor("theme", ui.theme.currentHighlight.Color);

        // 注册时间
        let timeElem = document.getElementById("timeTool");
        setInterval(function() {
            text(timeElem, ui.date.format(new Date(), "yyyy-MM-dd EEEE , HH:mm"));
        }, 1000);
    }
};

//#region 布局初始化

function initHeader(head, headerWidth, headerTitle) {
    let screenHeader = head.getElementsByClassName("screen-header");
    if(!screenHeader || screenHeader.length === 0) {
        return;
    }
    screenHeader = screenHeader[0];
    css(screenHeader, {
        width: headerWidth + "px"
    });

    let screenBackground = screenHeader.getElementsByClassName("screen-background");
    if(screenBackground.length > 0) {
        screenBackground = screenBackground[0];
        css(screenBackground, {
            transform: "perspective(64px) rotateX(" + -Math.floor(64 / headerWidth * 100) + "deg)"
        });
    }

    let screenTitle = screenHeader.getElementsByClassName("screen-title");
    if(screenTitle.length > 0) {
        screenTitle = screenTitle[0];
        text(screenTitle, headerTitle);
    }

    const marginValue = Math.floor(headerWidth / 2) + "px";
    initToolButton(true, marginValue, pageSettingsOption.leftIconButtons);
    initToolButton(false, marginValue, pageSettingsOption.rightIconButtons);
}

function initToolButton(isLeft, marginValue, buttons) {
    const toolPanel = isLeft 
        ? document.getElementById("leftToolbar") 
        : document.getElementById("rightToolbar");
    if(!toolPanel) {
        return;
    }
    const cssSettings = isLeft ? { marginRight: marginValue } : { marginLeft: marginValue };
    css(toolPanel, cssSettings);

    if(!Array.isArray(buttons) || buttons.length === 0) {
        return;
    }

    const ul = createElement("ul");
    addClass(ul, "tools");
    if(isLeft) {
        css(ul, {
            float: "right"
        });
    }
    buttons.forEach(buttonSettings => {
        if(!buttonSettings) {
            return;
        }
        
        const li = createElement("li");
        addClass(li, "tool-item");
        if(buttonSettings.toggle) {
            addClass(li, "toggle-item");
        }

        const a = createElement("a");
        addClass(a, "map-element", "map-button");
        if(buttonSettings.text) {
            prop(a, "title", buttonSettings.text);
        }
        if(buttonSettings.id) {
            prop(a, "id", buttonSettings.id);
        }
        if(buttonSettings.icon) {
            html(a, buttonSettings.icon);
        }

        if(ui.core.isFunction(buttonSettings.handler)) {
            on(li, "click", toolButtonClickHandler(li, a, buttonSettings, toolPanelResizeHandlers));
        }
        
        append(li, a);
        append(ul, li);
    });
    append(toolPanel, ul);
}

//#endregion

function pageSettings(settings) {
    pageSettingsOption = ui.extend({}, pageSettingsOption, settings);
}

function pageInit(pageInitConfig) {
    initTitle(pageSettingsOption.title);

    const config = ui.extend({}, masterInitConfig, pageInitConfig);
    ui.page.init(config);
}

function bodyAppend(element) {
    if(!element || !ui.page.body) {
        return;
    }

    append(ui.page.body, element);
}

function toolPanelResize() {
    toolPanelResizeHandlers.forEach(item => {
        if(ui.core.isFunction(item)) {
            try {
                item();
            } catch(e) {
                console.error(e);
            }
        }
    });
}

export {
    pageSettings,
    pageInit,
    bodyAppend,
    toolPanelResize
};
