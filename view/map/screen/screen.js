import "./screen.css";

import ui from "../../../src/soonui";
import "../../../src/x-map/x-map";
import { createLayout } from "../../../src/screen/screen";
import { append, createElement, css, text, removeClass } from "../../../src/common/html/html-utils";
import { pageSettings, pageInit, toolPanelResize } from "../../../src/layout/screen-layout";

pageSettings({
    title: "SCREEN",
    header: "SOON.UI SCREEN",
    headerWidth: 360,
    leftIconButtons: [
        {
            id: "mapLayer",
            text: "图层控制",
            icon: "<i class='fas fa-th-large'></i>",
            toggle: true,
            handler: (checked, action) => action(ui.page.layerManager)
        },
        {
            id: "mapChange",
            text: "底图切换",
            icon: "<i class='fas fa-map'></i>",
            change: ["fa-map", "fa-plus"],
            handler: e => {}
        },
        {
            id: "map3DChange",
            text: "三维切换",
            icon: "<i class='fas fa-cube'></i>",
            change: ["fa-cube", "fa-stop"],
            handler: e => {}
        }
    ],
    rightIconButtons: [
        {
            id: "home",
            text: "回到原点",
            icon: "<i class='fas fa-home'></i>",
            handler: e => ui.messageShow("home")
        },
        {
            id: "fullScreen",
            text: "全屏",
            icon: "<i class='fas fa-arrows-alt'></i>",
            toggle: true,
            handler: checked => ui.messageShow(["fullScreen", checked])
        },
        {
            id: "navigator",
            text: "导航",
            icon: "<i class='fas fa-bars'></i>",
            toggle: true,
            handler: (checked, action) => action(ui.page.navigator)
        }
    ]
});

pageInit({
    created() {
        // 创建地图图层面板
        this.layerManager = createLayerManager();
        // 创建导航菜单
        this.navigator = createPageNavigator();

        this.centerPanel = createCenterPanel();
        this.panelManager = createPanelManager();
    },
    layout() {
        const width = this.contentBodyWidth;
        const height = this.contentBodyHeight;

        this.panelManager.arrange(width, height, this.panelManagerResizeFlag);
        this.panelManagerResizeFlag = true;

        this.centerPanel.restore();

        toolPanelResize();
    },
    load() {
        this.panelManager.show();
        this.centerPanel.show();
    }
});

//#region 工具栏

function createLayerManager() {
    const layerManager = new ui.xmap.MapLayerPanel({
        container: ui.page.body,
        top: ui.page.panelMarginValue,
        left: 0,
        height: 300,
        viewData: [
            { layerId: "restaurant", layerName: "美食", checked: true },
            { layerId: "cinema", layerName: "电影院", checked: true },
            { layerId: "ktv", layerName: "KTV", checked: true }
        ]
    });
    layerManager.hiding(e => {
        removeClass(document.getElementById("mapLayer"), ui.page.mapButtonActive);
    });
    layerManager.checked((e, layers) => {
        ui.messageShow(layers[0] + "，显示");
    });
    layerManager.unchecked((e, layers) => {
        ui.messageShow(layers[0] + "，隐藏");
    });

    return layerManager;
}

function createPageNavigator() {
    const menuList = new ui.xmap.MapMenuList({
        container: ui.page.body,
        top: ui.page.panelMarginValue,
        width: 120,
        height: 152,
        menus: [
            {
                icon: "fa-map-signs",
                text: "电子地图",
                handler: function() {
                    location.href = "javascript:void(0)";
                }
            },
            {
                icon: "fa-map-marker",
                text: "要素管理",
                handler: function() {
                    location.href = "javascript:void(0)";
                }
            },
            {
                icon: "fa-thumbs-up",
                text: "应急指挥",
                handler: function() {
                    location.href = "javascript:void(0)";
                }
            }
        ]
    });
    menuList.hiding(function(e) {
        removeClass(document.getElementById("navigator"), ui.page.mapButtonActive);
    });
    return menuList;
}

//#endregion

//#region 布局容器

function createCenterPanel() { 
    const element = createElement("div");
    element.id = "centerPanel";
    css(element, {
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "position"
    });

    const span = createElement("span");
    text(span, "地图");
    css(span, {
        fontSize: "18px",
        width: "100%",
        height: "40px",
        lineHeight: "40px",
        position: "absolute",
        textAlign: "center",
        top: "50%",
        marginTop: "-20px"
    });
    append(element, span);
    
    const panel = new ui.xmap.MapDialog({
        parent: ui.page.body,
        show: "up",
        done: "down",
        hide: "down",
        title: "中心区域",
        top: ui.page.headerHeight,
        suitable: false,
        resizeable: false,
        draggable: false,
        autoPosition: false,
        boxCtrls: false
    }, element);

    panel.restore = function() {
        const parentWidth = ui.page.contentBodyWidth;
        const parentHeight = ui.page.contentBodyHeight;

        const width = parentWidth 
            - (ui.page.panelManager.getLeftFenceWidth() + ui.page.panelMarginValue)
            - (ui.page.panelManager.getRightFenceWidth() + ui.page.panelMarginValue);
        const height = parentHeight - ui.page.panelMarginValue * 2;

        this.setSize(width, height, parentWidth, parentHeight);
    }

    return panel;
}

function createPanelManager() {
    const panelManager = createLayout({
        container: ui.page.body,
        layoutTop: 0,
        layoutBottom: ui.page.panelMarginValue,
        panelMargin: ui.page.panelMarginValue
    });
    panelManager
        .leftFence(320, false)
        .rightFence(320, false);

    // 左边
    createChartPiePanel(panelManager);
    createChartLinePanel(panelManager);
    createTabPanel(panelManager);

    // 右边
    createChartBarPanel(panelManager);
    createAlarmPanel(panelManager);

    return panelManager;
}

function createChartPiePanel(panelManager) {
    let alarms = ["库区报警", "温度报警"];
    let values = [];

    alarms.forEach(function(alarm) {
        values.push({
            name: alarm,
            value: ui.random.getNum(25, 150)
        });
    });

    ui.page.chartPiePanel = ui.screen.module.LayoutChartPiePanel({
        panelManager: panelManager,
        name: "chartPiePanel",
        group: "Left",
        title: "饼图",
        height: 240,
        categoryColumn: "name",
        valueColumn: "value",
        chartColors: ["#4BD9FF", "#FE5A3E"],
        viewData: values
    });
}

function createChartLinePanel(panelManager) {
    var alarms = ["设备位移","设备倒地","设备警告","设备低电","设备掉线"],
        week = ["一","二","三","四","五","六","日"],
        weekValues = [];

    alarms.forEach(function(alarm) {
        week.forEach(function(w) {
            weekValues.push({
                name: w,
                group: alarm,
                value: ui.random.getNum(25, 150)
            });
        });
    });

    ui.page.chartLinePanel = ui.screen.module.LayoutChartLinePanel({
        panelManager: panelManager,
        name: "chartLinePanel",
        group: "Left",
        title: "折线图",
        height: 200,
        categoryColumn: "name",
        groupColumn: "group",
        valueColumn: "value",
        viewData: weekValues
    });
} 

function createTabPanel(panelManager) {
    function createTabBody(name) {
        let tabBody = createElement("div");
        let tabName = createElement("div");
        text(tabName, name);
        css(tabName, {
            width: "100%",
            height: "40px",
            lineHeight: "40px",
            position: "absolute",
            top: "50%",
            marginTop: "-20px",
            textAlign: "center"
        });
        append(tabBody, tabName);
        return tabBody;
    }

    ui.page.tabPanel = ui.screen.module.LayoutTabPanel({
        panelManager: panelManager,
        name: "TabPanel",
        group: "Left",
        flexibleHeight: 1,
        tabs: [
            { title: "Tab1", body: createTabBody("Tab1") },
            { title: "Tab2", body: createTabBody("Tab2") },
            { title: "Tab3", body: createTabBody("Tab3") }
        ]
    });
}

function createChartBarPanel(panelManager) {
    let value = [];
    let titles = ["仓库报警", "库区报警", "温度报警", "湿度报警", "门禁报警"];

    titles.forEach(function(item, index) {
        value.push({
            name: item,
            value: ui.random.getNum(30, 100)
        });
    });

    ui.page.chartBarPanel = ui.screen.module.LayoutChartBarPanel({
        panelManager: panelManager,
        name: "chartBarPanel",
        group: "Right",
        title: "柱状图",
        height: 260,
        categoryColumn: "name",
        valueColumn: "value",
        viewData: value
    });
}

function createAlarmPanel(panelManager) {
    let roads = ["一号库区","二号库区","303库房","504库房","主门外侧","西区20米"];
    let alarmTypes = ["库区报警", "门禁报警", "库房报警", "温度报警", "湿度报警"];

    function getAlarms() {
        let i, len = ui.random.getNum(0, 5);
        let alarms = [];

        for(i = 0; i < len; i++) {
            let alarm = {
                id: ui.random.uuid(),
                level: ui.random.getNum(1, 5),
                address: roads[ui.random.getNum(0, roads.length)],
                event: alarmTypes[ui.random.getNum(0, alarmTypes.length)]
            };
            alarm.message = "【" + alarm.event + "】" + "在" + alarm.address + "出现预警事件";
            alarms.push(alarm);
        }
        return alarms;
    }

    ui.page.alarmPanel = ui.screen.module.LayoutMessagePanel({
        panelManager: panelManager,
        name: "AlarmPanel",
        group: "Right",
        title: "实时信息列表",
        itemKey: "id",
        flexibleHeight: 1,
        maxLength: 50
    });

    ui.page.alarmPanel.shown(function(e) {
        let that = this;
        function add() {
            let alarms = getAlarms();
            that.setViewData(alarms);
            setTimeout(add, ui.random.getNum(1000, 5000))
        }
        setTimeout(function() {
            add();
        }, ui.random.getNum(1000, 5000));
    });
    ui.page.alarmPanel.messageclick(function(e, eventData) {
        let item = eventData.itemData;
        alert([item.message, item.level, item.id]);
    });
}

//#endregion