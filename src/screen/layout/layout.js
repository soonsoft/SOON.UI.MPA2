import ui from "../../soonui";
import { css } from "../../common/html/html-utils";

class LayoutFence {

    constructor(option) {
        this.panelNames = [];
        this.flexibleHeight = 0;

        this.parentGroup = option.parentGroup;
        this.width = option.width;
        this.flexible = !!option.flexible;
    }

    add(name) {
        let panel = this.parentGroup.get(name);
        if(!panel) {
            throw new TypeError(ui.str.format("the name [{0}] is not exists.", name));
        }
        this.flexibleHeight += panel.flexibleHeight || 0;
        this.panelNames.push(name);
    }

    get(index) {
        let name = this.panelNames[index];
        if(!name) {
            return null;
        }

        return this.parentGroup.get(name);
    }

    getName(index) {
        return this.panelNames[index] || null;
    }

    set(index, name) {
        this.panelNames[index] = name;
    }

    forEach(fn) {
        if(ui.core.isFunction(fn)) {
            this.panelNames.forEach((name, index) => {
                var panel = this.parentGroup.get(name);
                if(panel) {
                    fn.call(null, panel, index);
                }
            });
        }
    }

    overflow() {
        this.forEach(panel => {
            panel.overflow = true;
         });
    }

    getAllPanels() {
        const arr = [];
        this.forEach(function(panel) {
            arr.push(panel);
        });
        return arr;
    }

}

function getShowStyle(setStartFn) {
    return function() {
        let option = this.animator[0];
        setStartFn.call(this, option);
        option.onChange = left => {
            css(this.box, {
                left: left + "px"
            });
        };
        this.openMask();
        this.animator.onEnd = () => {
            this.onShown();
        };

        css(this.box, {
            top: this.positionTop + "px",
            left: option.begin + "px",
            display: "block"
        });
    };
}

class Layout {

    constructor(option) {
        this.leftGroup = new ui.KeyArray();
        this.leftFenceList = [];

        this.rightGroup = new ui.KeyArray();
        this.rightFenceList = [];

        this.container = option.container;
        this.layoutTop = ui.core.isNumber(option.layoutTop) ? option.layoutTop : 20;
        this.layoutBottom = ui.core.isNumber(option.layoutBottom) ? option.layoutBottom : 20;
        this.panelMargin = ui.core.isNumber(option.panelMargin) ? option.panelMargin : 20;

        this.isShown = false;

        ui.ctrls.DialogBox.setShowStyle("showFromLeft", getShowStyle(function(option) {
            option.begin = -this.offsetWidth;
            option.end = this.positionLeft;
        }));
        ui.ctrls.DialogBox.setShowStyle("showFromRight", getShowStyle(function(option) {
            let clientWidth = this.parent.width();
            option.begin = clientWidth;
            option.end = this.positionLeft;
        }));

        this.createRestore = function(panel) {
            let restoreAnimator = ui.animator({
                target: panel.box,
                ease: ui.AnimationStyle.easeFromTo,
                onChange: function(val) {
                    css(this.target, {
                        top: val + "px"
                    });
                }
            }).add({
                target: panel.box,
                ease: ui.AnimationStyle.easeFromTo,
                onChange: function(val) {
                    css(this.target, {
                        left: val + "px"
                    });
                }
            });
            restoreAnimator.duration = 240;

            panel.restore = function() {
                let option = restoreAnimator[0];
                option.begin = parseFloat(css(option.target, "top"));
                option.end = this.positionTop;

                option = restoreAnimator[1];
                option.begin = parseFloat(css(option.target, "left"));
                option.end = this.positionLeft;

                restoreAnimator.start();
            };
        };
    }

    //#region 私有方法

    _addFence(width, flexible, fenceList, group) {
        if(!ui.core.isNumeric(width)) {
            throw new TypeError("the width is invalid.");
        }
        if(arguments.length === 1) {
            flexible = true;
        }
        flexible = !!flexible;
        fenceList.push(new LayoutFence({
            parentGroup: group,
            width: width,
            flexible: flexible
        }));
    }

    _ensureFence(group, fenceIndex) {
        let fenceList;
        let isLeft = group === "Left";

        if(!ui.core.isNumeric(fenceIndex) || fenceIndex < 0) {
            fenceIndex = 0;
        }

        fenceList = isLeft ? this.leftFenceList : this.rightFenceList;
        if(fenceList.length === 0) {
            fenceList.push(new LayoutFence({
                parentGroup: isLeft ? this.leftGroup : this.rightGroup,
                width: 240,
                flexible: true
            }));
        } else if(fenceIndex >= fenceList.length) {
            throw new TypeError("the fenceIndex in invalid.");
        }

        return fenceIndex;
    }

    _getFenceWidth(fenceList) {
        if(!Array.isArray(fenceList) || fenceList.length === 0) {
            return 0;
        }
        let width = 0;
        fenceList.forEach(function(fence) {
            width += fence.offsetWidth;
        });
        return width;
    }

    _addPanel(name, group, option, fenceIndex) {
        let content = option.content;
        let flexibleHeight = option.flexibleHeight;
        let flexibleMaxHeight = option.flexibleMaxHeight;
        
        fenceIndex = this._ensureFence(group, fenceIndex);

        delete option.content;
        delete option.flexibleHeight;
        delete option.flexibleMaxHeight;

        option.titleHeight = 30;
        option.boxCtrls = false;
        option.show = "showFrom" + group;
        option.hide = group.toLowerCase();
        option.done = option.hide;
        option.maskable = false;
        option.suitable = false;
        option.resizeable = false;
        option.autoPosition = false;

        if(this.container) {
            option.parent = this.container;
        }

        const panel = new ui.xmap.MapDialog(option, content);
        panel.positionLeft = panel.positionTop = 0;
        panel.fenceIndex = fenceIndex;
        panel.overflow = false;
        panel.flexibleHeight = 0;
        if(ui.core.isNumeric(flexibleHeight) && flexibleHeight > 0) {
            panel.flexibleHeight = flexibleHeight;
        }
        panel.flexibleMaxHeight = 0;
        if(ui.core.isNumeric(flexibleMaxHeight) && flexibleMaxHeight > option.height) {
            panel.flexibleMaxHeight = flexibleMaxHeight;
        }

        this.createRestore(panel);
        panel.moveStart(function(e) {
            panel.box.addClass("ui-fixed-top");
        });
        panel.moveEnd(function(e) {
            var top = this.positionTop,
                left = this.positionLeft,
                currentTop = parseFloat(this.box.css("top")) || null,
                currentLeft = parseFloat(this.box.css("left")) || null;

            if(Math.abs(currentTop - top) < this.offsetHeight
                    && Math.abs(currentLeft - left) < this.offsetWidth / 2) {
                panel.box.removeClass("ui-fixed-top");
                this.restore();
            }
        });

        if(group === "Left") {
            this._putLeftPanel(name, panel, fenceIndex);
        } else if(group === "Right") {
            this._putRightPanel(name, panel, fenceIndex);
        }

        return panel;
    }

    _putLeftPanel(name, panel, fenceIndex) {
        this.leftGroup.set(name, panel);
        this.leftFenceList[fenceIndex].add(name);
    }

    _putRightPanel(name, panel, fenceIndex) {
        this.rightGroup.set(name, panel);
        this.rightFenceList[fenceIndex].add(name);
    }

    _doArrangeLeftByFlexible(startLeft, width, height, fence) {
        let maxWidth = 0;
        let oldMaxWidth = 0;
        let currentHeight = this.layoutTop;
        let currentLeft = startLeft + this.panelMargin;

        const panelList = fence.getAllPanels();

        for(let i = 0, len = panelList.length; i < len;) {
            let panel = panelList[i];
            panel.overflow = false;

            if(maxWidth < panel.offsetWidth) {
                oldMaxWidth = maxWidth;
                maxWidth = panel.offsetWidth;
                if(oldMaxWidth === 0) {
                    oldMaxWidth = maxWidth;
                }
            }
            // 宽度
            if(currentLeft + maxWidth > width) {
                panel.overflow = true;
                i++;
                continue;
            }

            // 高度
            currentHeight += this.panelMargin;
            if(currentHeight + panel.offsetHeight > height) {
                if(panel.offsetHeight + this.layoutTop > height) {
                    // 如果高度溢出，强行渲染
                    panel.positionTop = this.layoutTop;
                    panel.positionLeft = currentLeft;
                    i++;
                }
                currentHeight = this.layoutTop;
                currentLeft = currentLeft + oldMaxWidth + this.panelMargin;
                maxWidth = 0;
            } else {
                panel.positionTop = currentHeight;
                panel.positionLeft = currentLeft;
                currentHeight += panel.offsetHeight;
                i++;
            }
        }

        fence.offsetWidth = currentLeft + maxWidth - startLeft;
    }

    _doArrangeLeft(startLeft, width, height, fence) {
        let maxWidth = 0; 
        let currentHeight = this.layoutTop;
        let surplusHeight = 0;
        let currentLeft = startLeft + this.panelMargin;
        
        const panelList = fence.getAllPanels();
        const percentArr = [];

        let len = panelList.length;
        for(let i = 0; i < len; i++) {
            let panel = panelList[i];
            let size = {
                offsetWidth: panel.option.width,
                offsetHeight: panel.option.height
            };
            panel.sizeInfo = size;

            percentArr[i] = panel.flexibleHeight / fence.flexibleHeight;
            surplusHeight += size.offsetHeight;
        }
        surplusHeight += len * this.panelMargin;
        surplusHeight = height - surplusHeight;

        len = panelList.length;
        for(let i = 0; i < len; i++) {
            let panel = panelList[i];
            panel.overflow = false;
            let size = panel.sizeInfo;
            if(maxWidth < size.offsetWidth) {
                maxWidth = size.offsetWidth;
            }

            // 高度
            currentHeight += this.panelMargin;
            if(currentHeight - this.layoutTop + size.offsetHeight > height) {
                panel.overflow = true;
                continue;
            } else {
                panel.positionTop = currentHeight;
                panel.positionLeft = currentLeft;

                if(surplusHeight > 0) {
                    let offsetHeight = size.offsetHeight + Math.floor(percentArr[i] * surplusHeight);
                    if(panel.flexibleMaxHeight && offsetHeight > panel.flexibleMaxHeight) {
                        offsetHeight = panel.flexibleMaxHeight;
                    }
                    size.offsetHeight = offsetHeight;
                }
                currentHeight += size.offsetHeight;
                panel._setSize(null, size.offsetHeight);
            }
        }

        fence.offsetWidth = currentLeft + maxWidth - startLeft;
    }

    _doArrangeRightByFlexible(startRight, width, height, fence) {
        let maxWidth = 0;
        let currentHeight = this.layoutTop;
        let currentRight = width - startRight - this.panelMargin;
        
        const panelList = fence.getAllPanels();
        const column = [];
        for(let i = 0, len = panelList.length; i < len;) {
            let panel = panelList[i];
            if(maxWidth < panel.offsetWidth) {
                maxWidth = panel.offsetWidth;
            }

            currentHeight += this.panelMargin;
            if(currentHeight + panel.offsetHeight > height) {
                if(panel.offsetHeight + this.layoutTop > height) {
                    panel.positionTop = this.layoutTop;
                    panel.positionLeft = currentLeft;
                    i++;
                } else {
                    column.forEach(function(item) {
                        item.positionLeft = currentRight - item.offsetWidth;
                    });
                }
                currentHeight = this.layoutTop;
                currentRight = currentRight - maxWidth - this.panelMargin;
                maxWidth = 0;
                column.length = 0;
            } else {
                panel.positionTop = currentHeight;
                currentHeight += panel.offsetHeight;
                column.push(panel);
                i++;
            }
        }

        column.forEach(function(item) {
            item.positionLeft = currentRight - item.offsetWidth;
        });

        fence.offsetWidth = width - currentRight + maxWidth;
    }

    _doArrangeRight(startRight, width, height, fence) {
        let maxWidth = 0;
        let currentHeight = this.layoutTop;
        let surplusHeight = 0;
        let currentRight = width - startRight - this.panelMargin;

        const panelList = fence.getAllPanels();
        const percentArr = [];

        let len = panelList.length;
        for(let i = 0; i < len; i++) {
            let panel = panelList[i];
            let size = {
                offsetWidth: panel.option.width,
                offsetHeight: panel.option.height
            };
            panel.sizeInfo = size;

            percentArr[i] = panel.flexibleHeight / fence.flexibleHeight;
            surplusHeight += size.offsetHeight;
        }
        surplusHeight += len * this.panelMargin;
        surplusHeight = height - surplusHeight;
        
        let column = [];
        len = panelList.length;
        for(let i = 0; i < len; i++) {
            let panel = panelList[i];
            panel.overflow = false;
            let size = panel.sizeInfo;
            if(maxWidth < size.offsetWidth) {
                maxWidth = size.offsetWidth;
            }

            currentHeight += this.panelMargin;
            if(currentHeight - this.layoutTop + size.offsetHeight > height) {
                panel.overflow = true;
                continue;
            } else {
                panel.positionTop = currentHeight;
                column.push(panel);

                if(surplusHeight > 0) {
                    let offsetHeight = size.offsetHeight + Math.floor(percentArr[i] * surplusHeight);
                    if(panel.flexibleMaxHeight && offsetHeight > panel.flexibleMaxHeight) {
                        offsetHeight = panel.flexibleMaxHeight;
                    }
                    size.offsetHeight = offsetHeight;
                }
                currentHeight += size.offsetHeight;
                panel._setSize(null, size.offsetHeight);
            }
        }

        column.forEach(function(item) {
            item.positionLeft = currentRight - item.offsetWidth;
        });

        fence.offsetWidth = width - currentRight + maxWidth;
    }

    //#endregion

    leftFence(width, flexible) {
        this._addFence(width, flexible, this.leftFenceList, this.leftGroup);
        return this;
    }

    rightFence(width, flexible) {
        this._addFence(width, flexible, this.rightFenceList, this.rightGroup);
        return this;
    }

    addLeftPanel(name, option, fenceIndex) {
        return this._addPanel(name, "Left", option, fenceIndex);
    }

    getLeftPanel(name) {
        return this.leftGroup.get(name);
    }

    getLeftFenceWidth() {
        return this._getFenceWidth(this.leftFenceList);
    }

    addRightPanel(name, option, fenceIndex) {
        return this._addPanel(name, "Right", option, fenceIndex);
    }

    getRightPanel(name) {
        return this.rightGroup.get(name);
    }

    getRightFenceWidth() {
        return this._getFenceWidth(this.rightFenceList);
    }

    show() {
        let panelList = this.leftGroup.filter(function(i) {
            return !i.overflow;
        });
        for(let i = 0, len = panelList.length; i < len; i++) {
            let panel = panelList[i];
            if(i === 0) {
                panel.show();
            } else {
                setTimeout((function(p) {
                    return function() {
                        p.show();
                    };
                })(panel), 100 * i);
            }
        }

        panelList = this.rightGroup.filter(function(i) {
            return !i.overflow;
        });

        for(let i = 0, len = panelList.length; i < len; i++) {
            let panel = panelList[i];
            if(i === 0) {
                panel.show();
            } else {
                setTimeout((function(p) {
                    return function() {
                        p.show();
                    };
                })(panel), 100 * i);
            }
        }

        this.isShown = true;
    }

    hide() {
        this.isShown = false;
        // TODO 未完成
    }

    arrange(width, height, restore) {
        let startLeft = 0;
        let startRight = 0;

        const maxWidth = Math.floor(width / 2) - this.panelMargin * 2;
        const maxHeight = height - this.layoutBottom - this.layoutTop;

        if(this.leftGroup.length > 0) {
            for(let i = 0, len = this.leftFenceList.length; i < len; i++) {
                let fence = this.leftFenceList[i];
                if(startLeft + fence.width > maxWidth) {
                    fence.overflow();
                    continue;
                }
                if(fence.flexible) {
                    this._doArrangeLeftByFlexible(startLeft, maxWidth, maxHeight, fence);
                } else {
                    this._doArrangeLeft(startLeft, maxWidth, maxHeight, fence);
                }
                startLeft += fence.offsetWidth;
            }
        }
        if(this.rightGroup.length > 0) {
            for(let i = 0, len = this.rightFenceList.length; i < len; i++) {
                let fence = this.rightFenceList[i];
                if(startRight + fence.width > maxWidth) {
                    fence.overflow();
                    continue;
                }
                if(fence.flexible) {
                    this._doArrangeRightByFlexible(startRight, width, maxHeight, fence);
                } else {
                    this._doArrangeRight(startRight, width, maxHeight, fence);
                }
                startRight += fence.offsetWidth;
            }
        }

        if(restore) {
            this.restore();
        }
    }

    restore() {
        if(this.leftGroup.length > 0) {
            let panelList = this.leftGroup.filter(panel => {
                if(panel.overflow) {
                    panel.box.css("display", "none")
                }
                return !panel.overflow;
            });
            for(let i = 0, len = panelList.length; i < len; i++) {
                let panel = panelList[i];
                if(panel.isShow()) {
                    panel.restore();
                } else {
                    panel.show();
                }
            }
        }

        if(this.rightGroup.length > 0) {
            let panelList = this.rightGroup.filter(panel => {
                if(panel.overflow) {
                    panel.box.css("display", "none")
                }
                return !panel.overflow;
            });
            for(let i = 0, len = panelList.length; i < len; i++) {
                let panel = panelList[i];
                if(panel.isShow()) {
                    panel.restore();
                } else {
                    panel.show();
                }
            }
        }
    }
}

function createLayout(option) {
    return new Layout(option);
}

export {
    createLayout
};