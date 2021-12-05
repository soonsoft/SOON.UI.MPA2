import ui from "../../../soonui";
import { defineScreenModule } from "../../util/define";
import LayoutBaseModule from "./layout-base-module";

const $ = ui.$;

defineScreenModule("LayoutListPanel", LayoutBaseModule, {
    _init(option) {
        const events = ["selected", "back", "enter"];
        this._super(option, events);
    },
    _createContent() {
        const content = $("<div style='width:100%;height:100%;overflow:hidden;position:relative;' />");
        return content;
    },
    _initPanel() {
        let itemFormatter = this.option.itemFormatter;
        if(!ui.core.isFunction(itemFormatter)) {
            let icon = this.option.icon;
            let nameField = this.option.nameField;
            itemFormatter = function(item, index) {
                let name = "未知名称";
                if(item) {
                    name = ui.core.isString(item) 
                        ? item 
                        : (ui.core.isFunction(nameField) ? nameField(item) : item[nameField]);
                }
                return [
                    "<i class='ui-list-view-item-icon fa ", icon, "' />",
                    "<span class='ui-list-view-item-text'>", name, "</span>"
                ].join("");
            };
        }
        this.panel.list = new ui.screen.OperateList({
            width: this.panel.contentWidth,
            height: this.panel.contentHeight,
            itemFormatter: itemFormatter
        }, this.panelContent);
        this.panel.list.selected((e, eventData) => {
            this.fire("selected", eventData);
        });
        // 事件代理
        this.panel.list.enter((e, eventData) => {
            this.fire("enter", eventData);
        });
        this.panel.list.back((e, eventData) => {
            this.fire("back", eventData);
        });
        this.resize(function(e) {
            this.panel.list.setSize(this.panel.contentWidth, this.panel.contentHeight);
        });

        if(Array.isArray(this.option.viewData)) {
            this.panel.list.setViewData(this.option.viewData);
        }
    },
    setViewData(viewData) {
        if(this.panel.list) {
            this.panel.list.setViewData(viewData);
        }
    }
});