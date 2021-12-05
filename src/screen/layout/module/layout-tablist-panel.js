import ui from "../../../soonui";
import { createElement } from "../../../common/html/html-utils";
import { defineScreenModule } from "../../util/define";
import LayoutBaseModule from "./layout-base-module";

defineScreenModule("LayoutTabListPanel", LayoutBaseModule, {
    _init(option) {
        const events = ["tabchanged", "tabchanging"];
        this._super(option, events);
    },
    _render(option) {
        /*
            listOptions: { 
                title: "tabName", 
                icon: "listItemIcon", 
                nameField: "listItemNameField", 
                listName: listName, 
                loadHandler: load data handler,
                selectedHandler: selected event handler,
                enterHandler: enter event handler,
                backHandler: back event handler
            }
        */
        this.listOptions = option.listOptions;
        delete option.listOptions;

        option.tabs = [];
        if(Array.isArray(this.listOptions)) {
            this.listOptions.forEach((item, index) => {
                option.tabs.push({
                    title: item.title || "Tab" + (index + 1),
                    body: createElement("div")
                });
            });
        } else {
            this.listOptions = [];
        }

        this.lists = [];
        this.listStates = [];

        this._super(option);
    },
    _initPanel(panel) {
        panel.tab.changing((e, index) => {
            if(this.lists.length === 0) {
                return;
            }

            const lastIndex = panel.tab.getCurrentIndex();
            const list = this.lists[lastIndex];
            if(!list) {
                list.showList();
            }

            const eventData = {
                lastIndex: lastIndex,
                index: index,
                target: panel.tab
            };
            return this.fire("tabchanging", eventData);
        });
        panel.tab.changed((e, index) => {
            this.loadList(index);

            const eventData = {
                index: index,
                target: panel.tab
            };
            this.fire("tabchanged", eventData);
        });

        panel.resize(e => {
            const width = panel.contentWidth;
            const height = panel.contentHeight;
            this.lists.forEach(list => {
                list.setSize(width, height);
            });
        });
        
        ui.setTask(() => {
            panel.tab.showIndex(0, false);
        });
    },
    _createList(index) {
        const listOption = this.listOptions[index];
        let list = new ui.screen.OperateList(
            ui.extend({
                width: this.panel.contentWidth,
                height: this.panel.contentHeight,
                itemFormatter(item, index) {
                    let name = "未知名称";
                    let icon = listOption.icon;
                    if(item) {
                        name = ui.core.isString(item) 
                            ? item 
                            : (ui.core.isFunction(listOption.nameField) ? nameField(item) : item[listOption.nameField]);
                    }
                    return [
                        "<i class='ui-list-view-item-icon fa ", icon, "' />",
                        "<span class='ui-list-view-item-text'>", name, "</span>"
                    ].join("");
                }
            }, listOption), 
            this.panel.tab.bodies[index]);
        
        if(ui.core.isFunction(listOption.selectedHandler)) {
            list.selected((e, eventData) => {
                listOption.selectedHandler(eventData, list);
            });
        }
        if(ui.core.isFunction(listOption.enterHandler)) {
            list.enter((e, eventData) => {
                listOption.enterHandler(eventData, list);
            });
        }
        if(ui.core.isFunction(listOption.backHandler)) {
            list.back((e, eventData) => {
                listOption.backHandler(eventData, list);
            });
        }
        
        return list;
    },
    loadList(index, force) {
        if(!ui.core.isNumber(index)) {
            throw new TypeError("the parameter index must be number.");
        }
        let list = this.lists[index];
        let needLoad = !!force;

        const listOption = this.listOptions[index];
        if(!list) {
            list = this._createList(index);
            this.lists[index] = list;
            needLoad = true;
        }

        if(needLoad) {
            this.listStates[index] = false;
        }
        if(!this.listStates[index]) {
            this.listStates[index] = true;
            if(ui.core.isFunction(listOption.loadHandler)) {
                listOption.loadHandler(list, this);
            }
        }
    },
    findList: function(listName) {
        let index = -1;
        for(let i = 0; i < this.listOptions.length; i++) {
            let listOption = this.listOptions[i];
            if(listOption.listName === listName) {
                index = i;
                break;
            }
        }
        if(index === -1) {
            throw new TypeError("can not match listName [" + listName + "].");
        }

        let currentIndex = this.panel.tab.getCurrentIndex();
        let list = this.lists[index];

        if(index !== currentIndex) {
            this.panel.tab.showIndex(index);
        }
        if(!list) {
            list = this.loadList(index);
        }

        return list;
    }
});