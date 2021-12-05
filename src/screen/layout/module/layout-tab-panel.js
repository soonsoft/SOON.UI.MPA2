import ui from "../../../soonui";
import { defineScreenModule } from "../../util/define";
import LayoutBaseModule from "./layout-base-module";

// 基本Tab
const LayoutTabPanel = defineScreenModule("LayoutTabPanel", LayoutBaseModule, {
    _init(option) {
        const events = ["tabchanged", "tabchanging"];
        this._super(option, events);
    },
    _createContent() {
        return null;
    },
    _initPanel(panel) {
        panel.tab.changing((e, index) => {
            const eventData = {
                lastIndex: this.panel.tab.getCurrentIndex(),
                index: index,
                target: this.panel.tab
            };
            return this.fire("tabchanging", eventData);
        });
        panel.tab.changed((e, index) => {
            const eventData = {
                index: index,
                target: this.panel.tab
            };
            this.fire("tabchanged", eventData);
        });
        
        ui.setTask(() => {
            this.panel.tab.showIndex(0, false);
        });
    }
});