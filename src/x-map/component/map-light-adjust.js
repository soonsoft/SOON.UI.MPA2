import { defineXMapComponent } from "../util/define";
import MapToolPanel from "./map-tool-panel";

const $ = ui.$;

defineXMapComponent("MapLightAdjust", MapToolPanel, {
    _defineOption() {
        return {
            // 子元素格式化器
            layerFormatter: null,
            // 初始值
            value: 100,
            // xmap对象
            map: null,
            // 标题文字
            title: "底图亮度",
            width: 240,
            height: 48,
            right: 20
        };
    },
    _defineEvents() {
        return ["changed"];
    },
    _render() {
        const content = $("<div class='map-light-ctrl' />");
        content.append("<i class='map-light-icon far fa-adjust' title='" + this.option.title + "'></i>");
        const adjust = $("<div class='map-light-adjust' />");
        content.append(adjust);
        const valueText = $("<div class='map-light-value'>0%</div>");
        content.append(valueText);

        this._super();
        this.toolPanel.append(content);

        this.adjuster = adjust.slidebar();
        this.adjuster.changed((e, percent) => {
            valueText.html(percent + "%");
            if(this.option.map) {
                this.option.map.setOpacity(percent / 100);
            }
            this.fire("changed", percent);
        });
        this._isFirstShow = true;
    },
    show() {
        this._super.apply(this, arguments);
        if(this._isFirstShow) {
            this.adjuster.percentValue = this.option.value || 100;
            this._isFirstShow = false;
        }
    }
});