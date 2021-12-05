import "./login.css";

import ui from "../../src/soonui";
import Parallax from "./parallax";
import { append, createElement, css, on, text } from "../../src/common/html/html-utils";
import { initTitle } from "../../src/layout/common";
// import { createAjaxRequest } from "../../../common/components/ajax-extend";


const $ = ui.$;

const header = "SOON.UI LOGIN";
const imageName = "SOON.UI by SoonSoft";

initTitle("LOGIN");

// const ajax = createAjaxRequest({
//     baseUrl: "http://10.0.0.5:8080",
//     isAuth: true
// });
// const LoginURL = "/account/login";

const windowSize = {
    tiny: {
        width: 958,
        height: 512,
        startWidth: 0,
        startHeight: 0,
        logoTop: 70,
        logoSize: "2.5em",
        formTop: 284
    },
    small: {
        width: 1092,
        height: 614,
        startWidth: 1280,
        startHeight: 719,
        logoTop: 100,
        logoSize: "2.7em",
        formTop: 340
    },
    middle: {
        width: 1366,
        height: 768,
        startWidth: 1440,
        startHeight: 960,
        logoTop: 140,
        logoSize: "3.4em",
        formTop: 500
    },
    large: {
        width: 1920,
        height: 1080,
        startWidth: 2560,
        startHeight: 1440,
        logoTop: 200,
        logoSize: "4.2em",
        formTop: 712
    }
};

const loginWindow = {
    initial() {
        this.loginWindow = $("#loginWindow");
        this.loginPanel = this.loginWindow.children(".login-panel");
        this.bgImg = this.loginWindow.children(".bgImage");
        this.logo = this.loginPanel.find(".logo");
        this.loginContent = this.loginPanel.find(".form-content");
        this.loginButton = document.getElementById("loginButton");

        this.parallax = new Parallax(this.loginWindow, this.bgImg);
        this.initFocus();

        text(this.logo, header);
        
        let span = createElement("span");
        css(span, {
            marginRight: "10px"
        });
        text(span, imageName);
        append($(".image-name"), span);

        this.onResize();
        css(this.loginWindow, {
            visibility: "visible"
        });
        ui.page.resize(() => {
            this.onResize();
        }, ui.eventPriority.bodyResize);

        on(this.loginButton, "click", e => {
            let username = document.getElementById("username").value;
            let password = document.getElementById("password").value;
            ui.messageShow("登录成功");
            // text(this.loginButton, "正在登录...");
            // ajax
            //     .login(LoginURL, username, password, result => ui.messageShow("登录成功"))
            //         .finally(() => {
            //             text(this.loginButton, "登 录");
            //         });
        });
    },
    initFocus() {
        this.onSpotlightHandle = null;
        this.offSpotlightHandle = null;
        this.spotlightAnimator = ui.animator({
            target: $(".panel-background"),
            ease: ui.AnimationStyle.easeTo,
            onChange: function (val) {
                css(this.target, {
                    opacity: val / 100
                });
            }
        });
        this.spotlightAnimator.duration = 500;

        const onFocus = e => {
            this.parallax.enabled = false;
            clearTimeout(this.offSpotlightHandle);
            this.offSpotlightHandle = null;
            if (this.spotlightAnimator.isStarted) {
                this.spotlightAnimator.stop();
            }
            this.onSpotlightHandle = setTimeout(() => {
                this.onSpotlightHandle = null;
                this.onSpotlight();
            }, 200);
        };
        const onBlur = e => {
            this.parallax.enabled = true;
            clearTimeout(this.onSpotlightHandle);
            this.onSpotlightHandle = null;
            if (this.spotlightAnimator.isStarted) {
                this.spotlightAnimator.stop();
            }
            this.offSpotlightHandle = setTimeout(() => {
                this.offSpotlightHandle = null;
                this.offSpotlight();
            }, 200);
        };

        $("#username").focus(onFocus).blur(onBlur);
        $("#password").focus(onFocus).blur(onBlur);
    },
    onResize() {
        this.clientWidth = document.documentElement.clientWidth;
        this.clientHeight = document.documentElement.clientHeight;

        const size = this.getSize();
        const flag = size !== this.currentSize;
        this.currentSize = size;

        this.panelWidth = size.width;
        this.panelHeight = size.height;

        this.setLocation();
        if (flag) {
            this.setSize(size);
        }
    },
    getSize() {
        const sizeArray = ["tiny", "small", "middle", "large"];
        const width = this.clientWidth;
        const height = this.clientHeight;

        for (let i = sizeArray.length - 1; i >= 0; i--) {
            let size = windowSize[sizeArray[i]];
            if (width >= size.startWidth && height >= size.startHeight) {
                return size;
            }
        }
    },
    setLocation() {
        let left = (this.clientWidth - this.panelWidth) / 2;
        let top = (this.clientHeight - this.panelHeight) / 2;
        if (left < 0) {
            left = 0;
        }
        css(this.loginWindow, {
            top: top + "px",
            left: left + "px"
        });
    },
    setSize(size) {
        css(this.loginWindow, {
            width: this.panelWidth + "px",
            height: this.panelHeight + "px"
        });
        css(this.logo, {
            fontSize: size.logoSize
        });
        if (this.parallax) {
            this.parallax.resize(this.panelWidth, this.panelHeight);
        }
        this.elementAnimate(size.logoTop, size.formTop);
    },
    elementAnimate(logoTop, formTop) {
        if (!this.elemAnimator) {
            this.elemAnimator = ui.animator({
                target: this.logo,
                ease: ui.AnimationStyle.easeTo,
                onChange: function (val) {
                    css(this.target, {
                        top: val + "px"
                    });
                }
            }).add({
                target: this.logo,
                ease: ui.AnimationStyle.easeFrom,
                onChange: function (val) {
                    css(this.target, {
                        opacity: val / 100
                    });
                }
            }).add({
                target: this.loginContent,
                ease: ui.AnimationStyle.easeTo,
                onChange: function (val) {
                    css(this.target, {
                        top: val + "px"
                    });
                }
            }).add({
                target: this.loginContent,
                ease: ui.AnimationStyle.easeFrom,
                onChange: function (val) {
                    css(this.target, {
                        opacity: val / 100
                    });
                }
            });
            this.elemAnimator.duration = 500;
        }

        this.elemAnimator.stop();

        let option = this.elemAnimator[0];
        option.begin = parseFloat(css(option.target, "top"));
        option.end = logoTop;
        option = this.elemAnimator[1];
        option.begin = 0;
        option.end = 80;
        option = this.elemAnimator[2];
        option.begin = formTop + 200;
        option.end = formTop;
        option = this.elemAnimator[3];
        option.begin = 0;
        option.end = 100;

        this.elemAnimator.start();
    },
    onSpotlight() {
        const option = this.spotlightAnimator[0];
        option.begin = Math.floor(parseFloat(css(option.target, "opacity")) * 100) || 0;
        option.end = 40;
        this.spotlightAnimator.start();
    },
    offSpotlight() {
        const option = this.spotlightAnimator[0];
        option.begin = Math.floor(parseFloat(css(option.target, "opacity")) * 100) || 0;
        option.end = 0;
        this.spotlightAnimator.start();
    }
};

ui.page.ready(() => {
    loginWindow.initial();
});