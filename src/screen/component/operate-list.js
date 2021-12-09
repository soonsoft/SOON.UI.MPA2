import ui from "../../soonui";
import { defineScreenComponent } from "../util/define";
import "./operate-list.css";

const $ = ui.$;

function defaultItemTemplate(item, index) {
    let icon = this.option.icon;
    return [
        "<i class='ui-list-view-item-icon fa ", icon, "' />",
        "<span class='ui-list-view-item-text'>", item, "</span>"
    ].join("");
}

defineScreenComponent("OperateList", {
    _defineOption() {
        return {
            // 内容生成模板
            itemFormatter: defaultItemTemplate
        };
    },
    _defineEvents() {
        return ["selected", "back", "enter"];
    },
    _create() {
        this.width = this.option.width || this.element.width();
        this.height = this.option.height || this.element.height();

        this.listPanel = $("<div class='ui-tab-body' style='overflow:auto' />");
        this.detailPanel = $("<div class='ui-tab-body' />");

        this.list = null;
        this.tabView = null;
        this._detailHead = $("<div class='ui-operate-detail-head' />");
        this._detailBody = $("<div class='ui-operate-detail-body' />");

        this._backButton = $("<a class='ui-operate-detail-back'><i class='far fa-chevron-left' /></a>");
        this._detailText = $("<span class='ui-operate-detail-text' />");
        this._detailHead
            .append(this._backButton)
            .append(this._detailText);
        
        this.detailPanel
            .append(this._detailHead)
            .append(this._detailBody);
    },
    _render() {
        this.element.append(this.listPanel);
        this.element.append(this.detailPanel);

        this.list = ui.ctrls.ListView(
            ui.extend({
                hasRemoveButton: false,
                animatable: false,
            }, this.option), 
            this.listPanel
        );
        this.list.selected((function(e, eventData) {
            this.showDetail(eventData);
        }).bind(this));

        this.tabView = ui.ctrls.TabView({
            type: "view",
            bodyPanel: this.element,
            bodies: [this.listPanel[0], this.detailPanel[0]],
            duration: 360
        }, this.element);
        this.tabView.changed((function(e, index) {
            if(index === 0) {
                if(this.list) {
                    this.list.cancelSelection();
                }
            } else if(index === 1) {
                let eventData = this.list ? this.list.getSelection() : {};
                this.fire("enter", eventData);
            }
        }).bind(this));

        this._backButton.click((function(e) {
            this._back();
        }).bind(this));

        this.setSize(this.width, this.height);
        this.tabView.showIndex(0, false);
    },
    _back(animatable) {
        if(this.list) {
            let eventData = this.list.getSelection();
            this.list.cancelSelection();
            this.fire("back", eventData);
            this.tabView.showIndex(0, animatable);
        }
    },
    getViewData() {
        if(this.list) {
            return this.list.getViewData();
        }
        return [];
    },
    setViewData(viewData) {
        if(Array.isArray(viewData) && this.list) {
            this.option.viewData = viewData;
            this.list.setViewData(viewData);
        }
    },
    showList() {
        if(this.tabView) {
            if(this.tabView.getCurrentIndex() === 1) {
                this._back(false);
            }
        }
    },
    showDetail(eventData, animatable) {
        if(this.tabView) {
            if(!eventData) {
                eventData = {};
            }
            eventData.headElement = this._detailHead;
            eventData.bodyElement = this._detailBody;
            this.fire("selected", eventData);

            if(this.tabView.getCurrentIndex() === 0) {
                this.tabView.showIndex(1, animatable);
            } else {
                this.fire("enter", eventData);
            }
        }
    },
    setHeadText(text) {
        this._detailText.text(text);
    },
    setBodyInfo(data, target) {
        let infoPanel = target || this._detailBody;
        let html = [];

        if(Array.isArray(data)) {
            html.push("<ul class='ui-operate-detail-ul'>");
            data.forEach(function(item) {
                html.push("<li class='ui-operate-detail-li'>");
                html.push("<label class='ui-operate-detail-label'>", item.label, "</label>");
                html.push("<p class='ui-operate-detail-info'>", (item.value || "--"), "</p>");
                html.push("</li>")
            });
            html.push("</ul>");
        }

        infoPanel.html(html.join(""));
    },
    appendBodyItem(data, target) {
        const infoPanel = target || this._detailBody;
        if(Array.isArray(data)) {
            let ul = infoPanel.children(".ui-operate-detail-ul");
            if(ul.length === 0) {
                return;
            }

            data.forEach(function(item) {
                let li = $("<li class='ui-operate-detail-li' />");
                li.append(
                    $("<label class='ui-operate-detail-label' />").text(item.label));
                li.append(
                    $("<p class='ui-operate-detail-info' />").html((item.value || "--"))
                );
                ul.append(li);
            });
        }
    },
    getSelection() {
        return this.list ? this.list.getSelection() : null;
    },
    setSelection(index) {
        if(this.list) {
            this.list.setSelection(index);
        }
    },
    setSize(width, height) {
        this.width = width || this.element.width();
        this.height = height || this.element.height();
        this._detailBody.css("height", (height - 40) + "px");

        if(!this.tabView) {
            return;
        }
        this.tabView.putBodies(width, height);
        this.tabView.restore(false);
        this.fire("resize");
    }
});