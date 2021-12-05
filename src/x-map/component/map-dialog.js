import ui from "../../soonui";
import * as echarts from "echarts";
import { defineXMapComponent } from "../util/define";

const $ = ui.$;
const body = document.body;
const noop = function() {};

ui.ctrls.DialogBox.setShowStyle("rightShow", function () {
    const clientWidth = this.parent.width();

    let option = this.animator[0];
    option.begin = clientWidth;
    option.end = clientWidth - this.offsetWidth - 20;
    option.onChange = left => {
        this.box.css("left", left + "px");
    };
    this.openMask();
    this.animator.onEnd = () => {
        this.onShown();
    };

    this.box.css({
        "top": this.option.top + "px",
        "left": option.begin + "px",
        "display": "block"
    });
});

ui.ctrls.DialogBox.setShowStyle("leftShow", function () {
    let option = this.animator[0];
    option.begin = -this.offsetWidth;
    option.end = 20;
    option.onChange = left => {
        this.box.css("left", left + "px");
    };
    this.openMask();
    this.animator.onEnd = () => {
        this.onShown();
    };

    this.box.css({
        "top": this.option.top + "px",
        "left": option.begin + "px",
        "display": "block"
    });
});

defineXMapComponent("MapDialog", ui.ctrls.DialogBox, {
    _defineOption() {
        return {
            show: "up",
            done: "up",
            hide: "down",
            top: 48,
            width: 480,
            height: 360,
            maskable: false,
            suitable: false,
            resizeable: false,
            autoPosition: false,
            titleHeight: 30,
            tabs: null,
            style: {
                "border": "solid 1px",
                "border-radius": "16px 0 16px 0",
                "overflow": "hidden"
            },
            boxCtrls: [
                {
                    type: "closable", 
                    className: "style-dialog-button", 
                    css: null
                }
            ]
        };
    },
    _defineEvents() {
        const events = this._super();
        events.push("moveStart", "moveEnd");
        return events;
    },
    _render() {
        const title = this.option.title;
        this.option.title = {
            text: $("<span class='font-highlight'>" + title + "</span>"),
            hasHr: false,
            style: {
                "line-height": "30px",
                "background-color": "rgba(255,255,255,.1)",
                "overflow": "hidden"
            }
        };
        // 生成tab
        let tabFn;
        if(this.option.tabs) {
            tabFn = this._initTabs(this.option.tabs);
        }

        if(!this.option.showCloseButton) {
            this._initClosableButton = noop;
        }
        this._super();

        if(ui.core.isFunction(tabFn)) {
            this.tab = tabFn.call(this);
        }

        this.isMaximize = false;

        // 自适应
        if(this.option.autoPosition) {
            ui.page.resize(() => {
                if(this.isShow()) {
                    if(this.isMaximize) {
                        this._maximize(true);
                    } else {
                        this.box.css({
                            "top": this.option.top + "px",
                            "left": (this.option.show === "rightShow" ? this.parent.width() - this.offsetWidth - 20 : 20) + "px"
                        });
                    }
                }
            }, ui.eventPriority.elementResize);
        }
    },
    _initContent() {
        if(Array.isArray(this.option.tabs)) {
            return;
        }
        this._super();
    },
    _initDraggable() {
        const option = {
            target: this.box,
            parent: this.parent || body,
            hasIframe: this.hasIframe(),
            onBeginDrag: () => {
                this.fire("moveStart");
            },
            onEndDrag: () => {
                this.fire("moveEnd");
            }
        };
        this.titlePanel
            .addClass("draggable-handle")
            .draggable(option);
    },
    _initMaximizeButton() {
        this.maximizeBtn = $("<a href='javascript:void(0)' style='font-size:12px;'><i class='fa fa-window-maximize'></i></a>");
        this.maximizeBtn.attr("class", this.option.closeButtonStyle || "closable-button");
        if(this.option.showCloseButton) {
            this.maximizeBtn.css("right", "30px");
        }

        this.maximizeBtn.click(() => {
            this._maximize(!this.isMaximize);
        });
        this.box.append(this.maximizeBtn);
        if(this.tab) {
            this.resize(function(e) {
                this.tab.putBodies(this.contentWidth, this.contentHeight);
                this.tab.restore();
            });
        }
    },
    _maximize(state) {
        if(state === this.isMaximize) {
            return;
        }

        const parentWidth = this.parent.width();
        const parentHeight = this.parent.height();
        if(state) {
            this.isMaximize = true;
            this.maximizeBtn.html("<i class='fa fa-window-restore'></i>");
            this.box.css({
                "top": 0,
                "left": 0
            });
            this._setSize(parentWidth, parentHeight);
        } else {
            this.isMaximize = false;
            this.maximizeBtn.html("<i class='fa fa-window-maximize'></i>");
            this.box.css({
                "top": this.option.top + "px",
                "left": (this.option.show === "rightShow" ? parentWidth - this.offsetWidth - 20 : 20) + "px"
            });
            this._setSize(this.option.width, this.option.height);
        }
    },
    _initTabs(tabs) {
        if(!Array.isArray(tabs)) {
            return;
        }

        const title = this.option.title;
        title.style["background-color"];
        title.text = [];
        const tabBodies = [];
        for(let i = 0, len = tabs.length; i < len; i++) {
            let tab = tabs[i];
            title.text.push("<a class='dialog-tab-button' data-tab-index='", i, "'>");
            title.text.push("<span>", tab.title, "</span>");
            title.text.push("<i class='dialog-tab-button-pointer'></i>");
            title.text.push("</a>");

            let tabBody = null;
            if(ui.core.isJQueryObject(tab.body)) {
                tabBody = tab.body;
            } else if(ui.core.isDomObject(tab.body)) {
                tabBody = $(tab.body);
            }
            if(!tabBody) {
                if(ui.core.isString(tabBody)) {
                    tabBody = $(tab.body);
                } else {
                    tabBody = $("<div />");
                }
            }
            tabBody.addClass("ui-tab-body");
            tabBodies.push(tabBody);
        }
        title.text = $(title.text.join(""));

        return function() {
            const currentClass = "current-dialog-tab";
            this.contentPanel
                    .append(tabBodies)
                    .css("overflow", "hidden");
            this.titlePanel.click(function(e) {
                let elem = $(e.target);
                while (!elem.hasClass("dialog-tab-button")) {
                    elem = elem.parent();
                    if(elem.hasClass("ui-dialog-box-title")) {
                        return;
                    }
                }

                let index = parseInt(elem.attr("data-tab-index"), 10);
                if(index !== tab.getCurrentIndex()) {
                    tab.showIndex(index);
                }
            });

            this.contentPanel.addClass("white-panel");
            const tab = new ui.ctrls.TabView({
                type: "view",
                bodyPanel: this.contentPanel,
                duration: 500
            });
            tab.changing(function(e, index) {
                let button;
                for(let i = 0, len = title.text.length; i < len; i++) {
                    button = $(title.text[i]);
                    if(button.hasClass(currentClass)) {
                        button.removeClass(currentClass);
                        break;
                    }
                }
                button = $(title.text[index]);
                button.addClass(currentClass);
            });

            tab.putBodies(this.contentWidth, this.contentHeight);
            tab.restore();

            tab.getBody = function(index) {
                let len = this.bodies.length;
                if(index < 0 || index >= len) {
                    return null;
                }

                return $(this.bodies[index]);
            };

            return tab;
        };
    },
    initTemplateView(container, option) {
        if(!container) {
            throw new TypeError("在地图对话框中初始化模板视图时必须要传递容器。");
        }
        if(!option) {
            option = {};
        }

        if(ui.core.isString(option.template) && option.template.length > 0) {
            option.builder = ui.parseTemplate(option.template);
        }

        if(!ui.core.isPlainObject(option.formatter)) {
            option.formatter = {};
        }

        option.bindData = data => {
            if(!option.builder || !data) {
                option.clear();
                return;
            }
            container.html(option.builder.bind(data, option.formatter));
        };
        option.clear = () => container.empty();
        this.templateView = option;

        return this.templateView;
    },
    initGridView(container, option) {
        container = ui.getJQueryElement(container);
        if(!container) {
            throw new TypeError("在地图对话框中初始化表格时必须要传递容器。");
        }
        if(!option) {
            option = {
                pager: {
                    pageIndex: 1,
                    pageSize: 30
                },
                selection: false
            };
        }
        option.textFormatter = ui.ColumnStyle.cfn.paragraph;
        option.width = this.contentWidth;
        option.height = this.contentHeight;
        this.contentPanel.css("overflow", "hidden");
        this.gridView = new ui.ctrls.GridView(option, container);

        return this.gridView;
    },
    initImageView(container, option) {
        container = ui.getJQueryElement(container);
        if(!container) {
            throw new TypeError("在地图对话框中初始化图片视图时必须要传递容器。");
        }

        if(!option) {
            option = {};
        }

        if(!option.chooserSize) {
            option.chooserSize = 48;
        }

        let viewPanel = this.element.children(".image-view-panel");
        let chooserPanel = this.element.children(".image-preview-chooser");
        if(chooserPanel.length > 0) {
            if(option.direction === "vertical") {
                chooserPanel.css({
                    width: option.chooserSize + "px"
                });
            } else {
                chooserPanel.css({
                    height: option.chooserSize + "px"
                });
            }
        }
        if(viewPanel.length > 0) {
            if(option.direction === "vertical") {
                viewPanel.css({
                    width: (this.contentWidth - option.chooserSize - 18) + "px"
                });
            } else {
                viewPanel.css({
                    height: (this.contentHeight - option.chooserSize - 18) + "px"
                });
            }
        }

        option.imageMargin = 4;
        option.interval = false;
        this.imageView = container.imagePreview(option);
        this.imageView.ready(function(e, images) {
            let zoomer = new ui.ctrls.ImageZoomer();
            this.imageViewer.images.forEach(function(image) {
                let img = image.view.children("img");
                img.addImageZoomer(zoomer);
            });
        });

        return this.imageView;
    },
    initChartView(container, option) {
        container = ui.getJQueryElement(container);
        if(!container) {
            throw new TypeError("在地图对话框中初始化图表视图时必须要传递容器。");
        }

        if(!option) {
            option = {};
        }

        option.width = option.width || this.contentWidth;
        option.height = option.height || this.contentHeight;

        container.css({
            width: option.width + "px",
            height: option.height + "px",
            overflow: "hidden"
        });
        this.chartView = echarts.init(container.get(0));

        return this.chartView;
    },
    initVideoView(container, option) {
        container = ui.getJQueryElement(container);
        if(!container) {
            throw new TypeError("在地图对话框中初始化视频视图时必须要传递容器。");
        }

        if(this.operatePanel) {
            container.css("bottom", 0);
        }

        if(!option) {
            option = {};
        }

        let provider = option.provider || "HikVision";
        provider = ui.media[provider];
        if(!ui.core.isFunction(provider)) {
            provider = ui.media.HikVision;
        }

        this.videoView = new provider(option, container);

        return this.videoView;
    }
});