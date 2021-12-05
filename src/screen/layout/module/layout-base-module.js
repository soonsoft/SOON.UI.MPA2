import ui from "../../../soonui";
import { defineScreenModule } from "../../util/define";

export default defineScreenModule("LayoutBaseModule", {
    _initialize(useOption) {
        const defaultOption = {
            width: 300,
            height: 200,
            draggable: false
        };

        const option = ui.extend({}, defaultOption, useOption);

        this.panelManager = option.panelManager;
        this.name = option.name;
        this.group = option.group;

        if(ui.core.isFunction(option._createContent)) {
            this._createContent = option._createContent;
        }

        this.option = option;
        this._init(option);
        this._render(option);
    },
    _init(option, events) {
        if(!Array.isArray(events)) {
            events = [];
        }

        events.push("showing", "shown", "resize");
        this.eventDispatcher = new ui.CustomEvent(this);
        this.eventDispatcher.initEvents(events);
    },
    _render(option) {
        this.panelContent = null;
        if(ui.core.isFunction(this._createContent)) {
            this.panelContent = this._createContent();
        }

        const addPanelFn = this.group === "Left" 
            ? this.panelManager.addLeftPanel
            : this.panelManager.addRightPanel;

        option.content = this.panelContent;

        this.panel = addPanelFn.call(this.panelManager, this.name, this.option);
        // panel的事件代理
        this.panel.showing(e => {
            this.fire("showing");
        });
        this.panel.shown(e => {
            this.fire("shown");
        });
        this.panel.resize(e => {
            this.fire("resize");
        });

        this._initPanel(this.panel);
    },
    _createContent() {},
    _initPanel(panel) {},
    setViewData(data) {},
    getPanel() {
        return this.group === "Left" 
            ? this.panelManager.getLeftPanel(this.name)
            : this.panelManager.getRightPanel(this.name);
    }
});