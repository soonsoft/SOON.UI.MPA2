import ui from "../../soonui";
import { defineXMapComponent } from "../util/define";
import MapToolPanel from "./map-tool-panel";

const $ = ui.$;

defineXMapComponent("MapMenuList", MapToolPanel, {
    _defineOption() {
        return {
            width: 120,
            height: 120,
            right: 20,
            // 菜单列表
            menus: null
        };
    },
    _render() {
        this._super();

        this.toolPanel.click(e => {
            let elem = $(e.target);
            while(!elem.hasClass("map-menu-item")) {
                if(elem.hasClass(this.toolPanelClassName)) {
                    return;
                }
                elem = elem.parent();
            }
            let index = parseInt(elem.attr("data-index"), 10);
            if(isNaN(index)) {
                index = -1;
            }
            let menus = this.option.menus;
            if(index >= 0 && index < menus.length) {
                menus[index].handler.call(menus[index]);
            }
            this.hide();
        });

        this.setMenus(this.option.menus);
    },
    setMenus(menus) {
        if(!Array.isArray(menus)) {
            menus = [];
        }
        this.option.menus = menus;

        const html = [];
        html.push("<ul class='map-menu-list'>");
        menus.forEach(function(item, index) {
            if(!item) {
                return;
            }
            if(!ui.core.isFunction(item.handler)) {
                item.handler = noop;
            }

            html.push("<li class='map-menu-item' data-index='", index, "'>");
            if(item.icon) {
                html.push("<i class='map-menu-icon");
                if (ui.core.isFunction(item.icon)) {
                    html.push("'>");
                    html.push(item.icon.call(item));
                } else {
                    html.push(" fa ", item.icon, "'>");
                }
                html.push("</i>");
            }

            let text = item.text || item.name;
            html.push("<span class='map-menu-text'>");
            html.push(ui.core.isFunction(text) ? text.call(item) : text);
            html.push("<span>");
            html.push("</li>");
        });
        html.push("</ul>");
        this.toolPanel.html(html.join(""));
    }
});