import ui from "../../soonui";
import { defineScreenComponent } from "../util/define";
import "./message-list.css";

const $ = ui.$;

function defaultMessageTemplate(item, itemClass, group) {
    var html = [],
        alarmClass = "alarm-message-level" + item.level,
        key = item[this.option.itemKey];
    html.push("<li class='", itemClass, " ", alarmClass, "'", "data-key='", key, "'>");
    html.push("<b class='ui-message-list-item-border'></b>");
    html.push("<p class='ui-message-list-item-text'>", item.message, "</p>");
    html.push("</li>");
    return html.join("");
}

defineScreenComponent("MessageList", {
    _defineOption() {
        return {
            // 最多保留多少条消息
            maxLength: 20,
            // 视图数据
            viewData: null,
            // key字段
            itemKey: "id",
            // 内容生成模板
            messageTemplate: defaultMessageTemplate
        };
    },
    _defineEvents() {
        return ["added", "truncated", "messageclick"];
    },
    _create() {
        this.animator = ui.animator({
            ease: ui.AnimationStyle.easeTo,
            onChange: function (val, elem) {
                elem.css("transform", "translateY(" + val + "px)");
            }
        });
        this.animator.duration = 500;
        this.animator.messageBuffer = [];
        this.animator.onEnd = () => {
            let buffer = this.animator.messageBuffer;
            if(buffer.length > 0) {
                this.animator.messageBuffer = [];
                this._addMessage(buffer);
            } else {
                this._truncate();
            }
        };
    },
    _render() {
        this.messageContainer = $("<div class='ui-message-container' />");
        this.element.addClass("ui-message-list");
        this.element.append(this.messageContainer);

        this.element.click(e => {
            let elem = $(e.target);
            while(!elem.hasClass("ui-message-list-item")) {
                if(elem.hasClass("ui-message-list")) {
                    return;
                }
                elem = elem.parent();
            }

            const keyValue = elem.attr("data-key");
            let eventData = {
                itemData: null
            };

            let viewData = this.option.viewData;
            if(Array.isArray(viewData)) {
                const key = this.option.itemKey;
                for(let i = 0, len = viewData.length; i < len; i++) {
                    let item = viewData[i];
                    if(item[key] === keyValue) {
                        eventData.itemData = item;
                    }
                }
            }
            if(!eventData.itemData) {
                return;
            }
            this.fire("messageclick", eventData);
        });

        // 设置动画元素
        this.animator[0].target = this.messageContainer;

        if(this.option.viewData) {
            this.messageContainer.append(
                this._createMessageGroup(this.option.viewData));
        }
    },
    _createMessageGroup(messages) {
        let group = $("<ul class='ui-message-group' />");
        for(let i = 0, len = messages.length; i < len; i++) {
            let msg = messages[i];
            let item = this.option.messageTemplate.call(this, msg, "ui-message-list-item", group);
            group.append(item);
        }
        return group;
    },
    _addMessage(messages) {
        if(messages.length === 0) {
            return;
        }

        const maxLength = this.option.maxLength;
        if(messages.length > maxLength) {
            messages.splice(maxLength, messages.length - maxLength);
        }

        if(this.animator.isStarted) {
            let buffer = this.animator.messageBuffer;
            // 防止内存泄漏
            if(buffer.length + messages.length > maxLength) {
                if(messages.length >= maxLength) {
                    buffer.length = 0;
                } else {
                    buffer.splice(buffer.length - messages.length, messages.length);
                }
            }
            buffer.unshift.apply(buffer, messages);
            return;
        }

        if(!this.option.viewData) {
            this.option.viewData = messages;
        } else {
            this.option.viewData = messages.concat(this.option.viewData);
        }

        let option = this.animator[0];
        let currentTop = option.current || 0;
        let group = this._createMessageGroup(messages);
        option.target.prepend(group);
        currentTop += -group.height();
        
        option.begin = currentTop;
        option.end = 0;

        option.target.css("transform", "translateY(" + currentTop + "px)");

        this.animator.start();
        this.fire("added");
    },
    _truncate() {
        const count = this.option.viewData.length;
        const maxLength = this.option.maxLength;
        if(count <= maxLength) {
            return;
        }

        const eventData = {};
        eventData.removeItems = this.option.viewData.splice(maxLength, count - maxLength);
        eventData.removeLenght = eventData.removeItems.length;

        let groups = this.messageContainer.children();
        let size = 0;
        for(let i = 0, len = groups.length; i < len; i++) {
            let group = $(groups[i]);
            if(size > maxLength) {
                group.remove();
            } else {
                let list = group.children();
                if(list.length === 0) {
                    group.remove();
                } else {
                    size += list.length;
                    if(size > maxLength) {
                        $(Array.prototype.slice.call(list, list.length - (size - maxLength))).remove();
                    }
                }
            }
        }

        this.fire("truncated", eventData);
    },
    // API
    add(message) {
        if(!message) {
            return;
        }
        if(!Array.isArray(message)) {
            message = [message];
        }
        this._addMessage(message);
    },
    clear() {
        this.messageContainer.empty();
        this.option.viewData.length = 0;
    }
});