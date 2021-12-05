import ui from "../soonui";
import { createElement, text, append, addClass, prop } from "../common/html/html-utils";
import { initTitle, masterLoaded } from "./common";
// import { createAjaxRequest } from "../components/ajax-extend";

// ui.page.ajax = createAjaxRequest({
//     baseUrl: "http://10.0.0.5:8080",
//     isAuth: true
// });

let pageSettingsOption = {
    title: "TITLE",
    header: "HEADER",
    headerTabs: [],
    showHomeButton: false
};

const masterInitConfig = {
    master() {
        this.loaded(function() {
            masterLoaded();
        });
    },
    userPanel() {
        initHighlight();
        return {
            name: "Admin",
            department: "总裁办",
            position: "CEO",
            changeHighlightUrl(highlight) {
                let url = parseHighlightStyleUrl((url, arr) => {
                    arr[arr.length - 2] = highlight.Id;
                    return url + arr.join(".");
                });

                if(url) {
                    ui.theme.setHighlight(highlight, url);
                }
            },
            operateList: [
                { text: "登录", handler: "./login.html" },
                { text: "个性化" },
                { text: "修改密码" }, 
                { text: "退出" }
            ]
        };
    }
};

//#region prepare page layout

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
        let homeButton = document.getElementsByClassName("ui-home-button");
        if(homeButton.length === 0) {
            homeButton = createElement("a");
            addClass(homeButton, "ui-home-button");
            prop(homeButton, "javascript:void(0)");
            append(header, homeButton);
        }
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

//#endregion

//#region Theme

function initHighlight() {
    ui.theme.highlights = [
		{"Name":"琥珀色","Id":"Amber","Color":"#F29D00"},
		{"Name":"蓝色","Id":"Blue","Color":"#2078EF"},
		{"Name":"褐色","Id":"Brown","Color":"#752918"},
		{"Name":"洋红","Id":"Carmine","Color":"#FF2968"},
		{"Name":"青色","Id":"Cyan","Color":"#00CCCC"},
		{"Name":"暗红","Id":"DarkRed","Color":"#990000"},
		{"Name":"藏蓝","Id":"Default","Color":"#3E5A99"},
		{"Name":"草绿","Id":"GrassGreen","Color":"#99DA0D"},
		{"Name":"灰色","Id":"Gray","Color":"#909090"},
		{"Name":"绿","Id":"Green","Color":"#008A00"},
		{"Name":"靛蓝","Id":"Indigo","Color":"#5122B5"},
		{"Name":"光","Id":"Light","Color":"#FFCC00"},
		{"Name":"橙色","Id":"Orange","Color":"#FF8627"},
		{"Name":"粉红","Id":"Pink","Color":"#F567C5"},
		{"Name":"粉紫","Id":"PinkPurple","Color":"#A988DF"},
		{"Name":"紫","Id":"Purple","Color":"#9F4AC9"},
		{"Name":"玫瑰红","Id":"Rose","Color":"#BF1E4B"},
		{"Name":"海蓝","Id":"SeaBlue","Color":"#0F80C1"},
		{"Name":"天蓝","Id":"SkyBlue","Color":"#5DB2FF"},
		{"Name":"天际","Id":"SkyLine","Color":"#00C8F8"},
		{"Name":"亮绿色","Id":"GreenLight","Color":"#66FF99"},
		{"Name":"唇色","Id":"Lip","Color":"#D783A7"},
		{"Name":"金色","Id":"Golden","Color":"#BDB76B"},
		{"Name":"红色","Id":"Red","Color":"#E53935"},
		{"Name":"深空灰","Id":"SpaceGray","Color":"#616161"},
		{"Name":"翡翠","Id":"Jade","Color":"#1ABC9C"},
		{"Name":"蓝灰","Id":"BlueGray","Color":"#4B8BAE"},
		{"Name":"橄榄","Id":"Olive","Color":"#8AAD92"}
    ];
    
    //初始化主题
    let highlightName = parseHighlightStyleUrl((url, arr) => {
        return arr[arr.length - 2];
    })
    if(highlightName) {
        ui.theme.currentHighlight = ui.theme.getHighlight(highlightName);
    }
}

function parseHighlightStyleUrl(action) {
    let sheet = document.getElementById(ui.theme.highlightSheetId);
    if(!sheet) {
        return;
    }

    let styleUrl = sheet.href;
    let index = styleUrl.lastIndexOf("/");
    let url = "";
    if(index > -1) {
        url = styleUrl.substring(0, index) + "/";
    } else {
        index = 0;
    }
    let cssName = styleUrl.substring(index);
    return action(url, cssName.split("."));
}

//#endregion

function pageSettings(settings) {
    pageSettingsOption = ui.extend({}, pageSettingsOption, settings);
}

function pageInit(pageInitConfig) {
    initTitle(pageSettingsOption.title);
    initHead();

    const config = ui.extend({}, masterInitConfig, pageInitConfig);
    ui.page.init(config);
}

function bodyAppend(element) {
    if(!element || !ui.page.body) {
        return;
    }

    append(ui.page.body, element);
}

function addFormFunctions(box, fnOption) {
    if(!box) {
        return;
    }

    if(!fnOption) {
        fnOption = {};
    }

    let title = box.option.title;
    ["onAdd", "onUpdate"].forEach(name => {
        let isUpdate = !(name === "onAdd");
        let boxTitle = isUpdate ? "编辑" + title : "新建" + title;
        box[name] = (function(data) {
            this.$isUpdate = isUpdate;
            this.setTitle(boxTitle);
            this.fillForm(data || null);
            this.show();
        }).bind(box);

        ["fillForm", "getFormData"].forEach(name => {
            box[name] = ui.core.isFunction(fnOption[name]) 
                ? fnOption[name].bind(box) 
                : function() {};
        })
    });
}

ui.page.ctrlBag = ui.KeyArray();
function putToBag(key, ctrl) {
    if(!ui.core.isString(key)|| !key) {
        throw new TypeError("the parameter key is required.");
    }
    ui.page.ctrlBag.set(key, ctrl);
}

function getFromBag(key) {
    return ui.page.ctrlBag.get(key + "");
}

export {
    pageSettings,
    pageInit,
    bodyAppend,
    addFormFunctions,
    putToBag,
    getFromBag
};