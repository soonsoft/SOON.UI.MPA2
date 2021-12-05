import "./home.css";

import ui from "../../src/soonui";
import { pageSettings, pageInit, bodyAppend } from "../../src/layout/layout-master";

pageSettings({
    title: "HOME",
    header: "SOON.UI HOME"
});

pageInit({
    created() {
        this.tileContainer = createTiles();
        bodyAppend(this.tileContainer.container);
    },
    layout() {
        this.tileContainer.layout(
            this.contentBodyWidth, this.contentBodyHeight);
    }
});

function createTiles() {
    //const tileColor = "rgba(255, 255, 255, .4)";
    const tileColor = ui.theme.currentHighlight.Color;
    const tileIcon = new URL("../../resource/tile/Settings.png", import.meta.url).href;

    const tileContainer = ui.TileContainer(document.createElement("div"));
    tileContainer.addGroup("常用", [
        { type: "large", color: tileColor, title: "天气", icon: tileIcon, name: "weather", interval: 5, updateFn: updateWeather },
        { type: "wide", color: tileColor, title: "登录图片", icon: tileIcon, name: "loginImage", interval: 1, updateFn: picturePlay },
        { type: "medium", color: tileColor, title: "日期", icon: tileIcon, name: "date", interval: 1, updateStyle: "moveup", updateFn: ui.tiles.calendar },
        { type: "medium", color: tileColor, title: "时间", icon: tileIcon, name: "time", interval: 1, updateFn: ui.tiles.clock },
        { type: "medium", color: tileColor, title: "MANAGE", icon: tileIcon, link: "../manage/manage.html" },
        { type: "medium", color: tileColor, title: "LOGIN", icon: tileIcon, link: "../login/login.html" },
        { type: "medium", color: tileColor, title: "SCREEN", icon: tileIcon, link: "../map/screen/screen.html" },
        { type: "medium", color: tileColor, title: "X-MAP", icon: tileIcon, link: "../map/tradition/tradition.html" }
    ]);
    tileContainer.addGroup("日常网站", [
        { type: "wide", color: tileColor, title: "云之国", icon: tileIcon, link: "https://www.yzgit.com" },
        { type: "medium", color: tileColor, title: "Microsoft", icon: tileIcon, link: "https://www.microsoft.com/zh-cn/" },
        { type: "medium", color: tileColor, title: "Apple", icon: tileIcon, link: "https://www.apple.com.cn" },
        { type: "small", color: tileColor, title: "bing", icon: tileIcon, link: "http://cn.bing.com" },
        { type: "small", color: tileColor, title: "baidu", icon: tileIcon, link: "http://www.baidu.com" },
        { type: "small", color: tileColor, title: "sogou", icon: tileIcon, link: "https://www.sogou.com/" },
        { type: "small", color: tileColor, title: "google", icon: tileIcon, link: "https://www.google.com.hk" },
        { type: "medium", color: tileColor, title: "浏览器", icon: tileIcon, link: "https://www.microsoft.com/zh-cn/edge" },
        { type: "wide", color: tileColor, title: "SOON.UI", icon: tileIcon, link: "http://www.soonui.com" },
        { type: "medium", color: tileColor, title: "Github", icon: tileIcon, link: "https://github.com/" },
        { type: "medium", color: tileColor, title: "Vue", icon: tileIcon, link: "https://cn.vuejs.org/" },
        { type: "medium", color: tileColor, title: "React", icon: tileIcon, link: "https://reactjs.org/" },
        { type: "medium", color: tileColor, title: ".Net", icon: tileIcon, link: "https://dotnet.microsoft.com/" }
    ]);

    // 主题高亮色变化事件
    ui.page.hlchanged((e, highlight) => {
        tileContainer.groups.forEach(group => {
            for(let i = group.length - 1; i >= 0; i--) {
                let tile = group[i];
                tile.color = highlight.Color;
            }
        });
    });

    return tileContainer;
}

function updateWeather(tile) {
    const weatherData = {
        cityName: "南京",
        days: [
            { date: null, type: "1", temperature: 23, low: 19, high: 25, description: "阵雨转多云", windDirection: "东南风转西北风，3级" },
            { date: null, type: "1", temperature: null, low: 20, high: 28, description: "晴", windDirection: "东南风转西北风，3级" },
            { date: null, type: "1", temperature: null, low: 20, high: 28, description: "多云", windDirection: "东南风转西北风，3级" },
            { date: null, type: "1", temperature: null, low: 20, high: 27, description: "多云转阴", windDirection: "东南风转西北风，3级" },
            { date: null, type: "1", temperature: null, low: 22, high: 26, description: "阵雨", windDirection: "东南风转西北风，3级" },
            { date: null, type: "1", temperature: null, low: 21, high: 26, description: "阵雨", windDirection: "东南风转西北风，3级" }
        ]
    };
    const today = new Date();
    for(let i = 0, len = weatherData.days.length; i < len; i++) {
        let date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
        weatherData.days[i].date = ui.date.format(date, "yyyy-MM-dd") + "T00:00:00";
    }
    ui.tiles.weather(tile, weatherData);
}

function picturePlay(tile) {
    function getPicture(name) {
        return new URL(`../../resource/picture/${name}.jpg`, import.meta.url).href;
    }
    const images = [
        getPicture("1"), 
        getPicture("5"), 
        getPicture("12"), 
        getPicture("20"), 
        getPicture("27")
    ];
    ui.tiles.picture(tile, images);
}