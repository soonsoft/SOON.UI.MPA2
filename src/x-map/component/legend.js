import ui from "../../soonui";
import { defineXMapComponent } from "../util/define";

const $ = ui.$;

defineXMapComponent("Legend", {
    _defineOption() {
        return {
            closeButton: true,
            isShow: true,
            textField: "layerName",
            iconField: "layerIcon",
            data: null
        };
    },
    _create() {
        this.animator = ui.animator({
            target: this.element,
            ease: ui.AnimationStyle.easeFromTo,
            onChange: function(val) {
                this.target.css("bottom", val + "px");
            }
        });
        this.animator.duration = 300;

        this.onCloseButtonClickHandler = e => {
            let icon = this.closeButton.children("i");
            if(this.isShow()) {
                this.option.isShow = false;
                icon.removeClass("fa-angle-down").addClass("fa-angle-up");
                this.hide();
            } else {
                this.option.isShow = true;
                icon.removeClass("fa-angle-up").addClass("fa-angle-down");
                this.show();
            }
        };
    },
    _render() {
        if(this.option.closeButton) {
            this.closeButton = $("<a class='map-legend-button font-highlight-hover'></a>");
            if(this.option.isShow === false) {
                this.closeButton.html("<i class='fa fa-angle-up'></i>");
            } else {
                this.closeButton.html("<i class='fa fa-angle-down'></i>");
            }
            this.closeButton.click(this.onCloseButtonClickHandler);
            this.element.append(this.closeButton);
        }

        this.content = $("<ul class='map-legend-content font-highlight' />");
        this.element.append(this.content);
        this.parent = this.element.parent();
        const resizeFn = () => {
            const clientWidth = this.parent.width();
            this.element.css("left", (clientWidth - this.element.width()) / 2 + "px");

        };
        resizeFn();
        ui.page.resize(resizeFn, ui.eventPriority.elementResize);

        this.setViewData(this.option.viewData);
    },
    isShow: function() {
        return this.option.isShow !== false;
    },
    show: function() {
        if(this.animator.isStarted) {
            return;
        }

        let option = this.animator[0];
        option.begin = -this.element.height();
        option.end = 0;

        this.animator.start();
    },
    hide: function() {
        if(this.animator.isStarted) {
            return;
        }

        let option = this.animator[0];
        option.begin = 0;
        option.end = -this.element.height();

        this.animator.start();
    },
    setViewData: function(data) {
        if(!Array.isArray(data)) {
            return;
        }

        this.option.viewData = data;

        const htmlBuilder = [];
        data.forEach((item, index) => {
            let field;
            htmlBuilder.push("<li class='map-legend-item'>");
            field = item[this.option.iconField];
            if(ui.core.isFunction(field)) {
                htmlBuilder.push(field.call(this, item, index));
            } else {
                htmlBuilder.push("<img class='map-legend-icon' src='", field, "' alt='' />");
            }
            
            field = item[this.option.textField];
            if(ui.core.isFunction(field)) {
                htmlBuilder.push(field.call(this, item, index));
            } else {
                htmlBuilder.push("<span class='map-legend-text'>", field, "</span>");
            }
            htmlBuilder.push("</li>");
        });
        this.content.html(htmlBuilder.join(""));
    }
});