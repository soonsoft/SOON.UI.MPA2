import ui from "../soonui";
import { createElement, css, text, append, addClass, prop, on, html } from "../common/html/html-utils";
import { initTitle, masterLoaded, toolButtonClickHandler } from "./common";

ui.theme.currentTheme = "Galaxy";
ui.theme.backgroundColor = "#1A2637";
ui.theme.setHighlight({
    Name: "Galaxy",
    Color: "#00CCCC"
});

let pageSettingsOption = {
    title: "TITLE",
    header: "HEADER",
    showHomeButton: false,
    tools: []
};

const toolPanelResizeHandlers = new ui.KeyArray();

const masterInitConfig = {
    master() {
        this.mapButtonActive = "map-button-active";

        // 注册loaded事件
        this.loaded(() => {
            masterLoaded();
        });

        // 添加主题Tag颜色 
        ui.ctrls.Tag.addColor("theme", ui.theme.currentHighlight.Color);
    },
    userPanel() {
        return {
            name: "Admin",
            department: "总裁办",
            position: "CEO",
            operateList: [
                { text: "修改密码", url: "javascript:void(0)" }, 
                { text: "退出", url: "javascript:void(0)" }
            ]
        };
    }
};

//#region prepare page

function initHead() {
    let head = document.getElementById("head");
    if(!head) {
        return;
    }

    let header = head.getElementsByClassName("head-system-title");
    if(header.length === 0) {
        header = createElement("h1");
        addClass(header, "head-system-title", "title-color");
        append(header);
    } else {
        header = header[0];
    }

    if(pageSettingsOption.showHomeButton) {
        let homeButton = createElement("a");
        addClass(homeButton, "ui-home-button");
        prop(homeButton, "javascript:void(0)");
        append(header, homeButton);
    }

    let headerSpan = head.getElementsByClassName("head-system-title-text");
    let headerText = pageSettingsOption.header;
    if(headerSpan.length === 0) {
        headerSpan = createElement("span");
        addClass(headerSpan, "head-system-title-text");
        text(headerSpan, headerText);
        append(header, headerSpan);
    } else {
        text(headerSpan[0], headerText);
    }
}

function initMapContainer() {
    let contentBody = document.getElementById("body");
    contentBody = contentBody.getElementsByClassName("content-container");
    if(contentBody.length === 0) {
        throw new Error("not found .content-container element.");
    }

    ui.page.mapContainer = contentBody[0];
    addClass(ui.page.mapContainer, "map-contains");

    initMapDiv();
    initMapTools();
}

function initMapDiv() {
    const mapDiv = createElement("div");
    prop(mapDiv, {
        id: "map"
    });
    css(mapDiv, {
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "position"
    });

    const div = createElement("div");
    text(div, "地图");
    css(div, {
        fontSize: "18px",
        width: "100%",
        height: "40px",
        lineHeight: "40px",
        position: "absolute",
        textAlign: "center",
        top: "50%",
        marginTop: "-20px"
    });
    append(mapDiv, div);

    bodyAppend(mapDiv);
}

function initMapTools() {
    const mapToolbar = createElement("div");
    addClass(mapToolbar, "toolbar", "clear");

    const tools = pageSettingsOption.tools;
    if(Array.isArray(tools)) {
        tools.forEach(tool => {
            if(tool) {
                createTool(mapToolbar, tool.buttons, !!tool.isRight);
            }
        });
    }

    bodyAppend(mapToolbar);
}

function createTool(toolPanel, buttons, isRight) {
    if(!Array.isArray(buttons) || buttons.length === 0) {
        return;
    }

    const ul = createElement("ul");
    addClass(ul, "tools");
    if(isRight) {
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

        if(ui.core.isFunction(buttonSettings)) {
            append(li, buttonSettings());
        } else {
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
        }

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
    initHead();
    initMapContainer();

    const config = ui.extend({}, masterInitConfig, pageInitConfig);
    ui.page.init(config);
}

function bodyAppend(element) {
    if(!element) {
        return;
    }
    append(ui.page.mapContainer, element);
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