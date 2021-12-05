import ui from "../../soonui";
import { defineXMapComponent } from "../util/define";
import MapToolPanel from "./map-tool-panel";

const $ = ui.$;

defineXMapComponent("MapContextMenu", MapToolPanel, {
    _defineOption() {
        return {
            width: 160,
            height: 80,
            top: 0,
            left: 0
        };
    },
    _defineEvents() {
        return ["click"];
    },
    _create() {
        this._super();
        // 只需要fadeIn fadeOut动画效果
        this.animator.splice(0, 1);
        // 最多显示5个菜单项
        this.maxItemCount = 5;
    },
    _render() {
        this._super();

        this.toolPanel.css("overflow", "auto");
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
                this.fire("click", menus[index]);
            }
            this.hide();
        });
    },
    setMousePosition(mouseClientX, mouseClientY) {
        this.mouseClientX = mouseClientX;
        this.mouseClientY = mouseClientY;
    },
    setMenus(menus) {
        CloudAtlas.ctrls.MapMenuList.prototype.setMenus.call(this, menus);
        let len = this.option.menus.length;
        if(len > 5) {
            len = 5;
        }
        this.height = 40 * len + 32;
    },
    _preShow() {
        let clientWidth = document.documentElement.clientWidth;
        let clientHeight = document.documentElement.clientHeight;

        let containerOffset = this.container.offset();
        containerOffset.width = this.container.width();
        containerOffset.height = this.container.height();

        if((containerOffset.left + containerOffset.width) < clientWidth) {
            clientWidth = containerOffset.left + containerOffset.width;
        }
        if((containerOffset.top + containerOffset.height) < clientHeight) {
            clientHeight = containerOffset.top + containerOffset.height;
        }

        this.width = this.option.width;
        this.height = this.height;
        let top = this.mouseClientY || 0;
        let left = this.mouseClientX || 0;

        if(top + this.height > clientHeight) {
            top = top - ((top + this.height) - clientHeight);
        }
        if(left + this.width > clientWidth) {
            left = left - ((left + this.width) - clientWidth);
        }

        this.toolPanel.css({
            height: this.height + "px",
            top: top + "px",
            left: left + "px"
        });
    },
    show(animation) {
        this._preShow();
        if(this.isShow()) {
            return;
        }

        let toolPanel;
        while(showedToolPanelArray.length) {
            toolPanel = showedToolPanelArray.shift();
            if(toolPanel) {
                toolPanel.hide();
            }
        }
        if(this.fire("showing") === false) {
            return;
        }
        if(animation === false) {
            this.element.css({
                "display": "block",
                "opacity": 1
            });
            return;
        }

        this.animator.stop();

        let option = this.animator[0];
        option.ease = ui.AnimationStyle.easeTo;
        option.begin = parseFloat(option.target.css("opacity")) || 0;
        option.end = 100;

        option.target.css("display", "block");
        this._isShow = true;
        if(this.option.isExclusive) {
            showedToolPanelArray.push(this);
        }

        this.animator.onEnd = this.onShown;
        this.animator.start();
    },
    hide(animation) {
        if(!this.isShow()) {
            return;
        }

        if(this.fire("hiding") === false) {
            return;
        }

        if(animation === false) {
            this.element.css({
                "display": "none",
                "opacity": 0
            });
            return;
        }

        this.animator.stop();

        let option = this.animator[0];
        option.ease = ui.AnimationStyle.easeTo;
        option.begin = (parseFloat(option.target.css("opacity")) * 100) || 100;
        option.end = 0;

        this.animator.onEnd = this.onHidden;
        this._isShow = false;
        this.animator.start().then(function() {
            option.target.css("display", "none");
        });
    }
});