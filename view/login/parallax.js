import ui from "../../src/soonui";
import { css } from "../../src/common/html/html-utils";

export default class Parallax {
    constructor(view, image, width, height) {
        this.imageScale = 1.1;
        this.view = view;
        this.image = image;
        this.enabled = true;

        if(ui.core.type(width) === "number") {
            this.width = width;
        } else {
            this.width = this.view.width();
        }
        if(ui.core.type(height) === "number") {
            this.height = height;
        } else {
            this.height = this.view.height();
        }
        this.initial();
    }

    initial() {
        css(this.view, {
            position: "relative",
            overflow: "hidden"
        });
        css(this.image, {
            position: "absolute"
        });
        this.initialImageAnimator();
        this.view.mouseenter(e => {
            if (this.enabled) {
                this.changeImageLocation(e.clientX, e.clientY, true);
            }
        });
        this.view.mousemove(e => {
            if (this.enabled) {
                this.changeImageLocation(e.clientX, e.clientY);
            }
        });
        this.view.mouseleave(e => {
            if (this.enabled) {
                this.stopImageLocation();
            }
        });
    }

    initialImageAnimator() {
        this.imageAnimator = ui.animator({
            target: this.image,
            ease: ui.AnimationStyle.easeFromTo,
            onChange: function(val) {
                css(this.target, {
                    top: val + "px"
                });
            }
        }).add({
            target: this.image,
            ease: ui.AnimationStyle.easeFromTo,
            onChange: function(val) {
                css(this.target, {
                    left: val + "px"
                });
            }
        });
        this.imageAnimator.onEnd = () => {
            this.beginAnimation = false;
        };
        this.imageAnimator.duration = 200;
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.resetImageLocation();
    }

    resetImageLocation() {
        this.imageWidth = this.width * this.imageScale;
        this.imageHeight = this.height * this.imageScale;
        this.imageMoveWidth = this.imageWidth - this.width;
        this.imageMoveHeight = this.imageHeight - this.height;

        css(this.image, {
            width: this.imageWidth + "px",
            height: this.imageHeight + "px",
            top: -(this.imageMoveHeight / 2) + "px",
            left: -(this.imageMoveWidth / 2) + "px"
        });
    }

    changeImageLocation(x, y) {
        if(this.beginAnimation) {
            return;
        }
        const p = this.view.offset();
        x -= p.left + 1;
        y -= p.top + 1;

        const currentLeft = parseFloat(css(this.image, "left"));
        const currentTop = parseFloat(css(this.image, "top"));
        const left = -(this.imageMoveWidth * (x / this.width));
        const top = -(this.imageMoveHeight * (y / this.height));

        if(Math.abs(currentLeft - left) > 20 || Math.abs(currentTop - top) > 20) {
            let  option = this.imageAnimator[0];
            option.begin = currentTop;
            option.end = top;

            option = this.imageAnimator[1];
            option.begin = currentLeft;
            option.end = left;
            
            this.beginAnimation = true;
            this.imageAnimator.start();
        } else {
            css(this.image, {
                top: top + "px",
                left: left + "px"
            });
        }
    }

    stopImageLocation() {
        if(this.beginAnimation) {
            this.beginAnimation = false;
            this.imageAnimator.stop();
        }
    }

}