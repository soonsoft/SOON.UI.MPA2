import ui from "../../soonui";

function checkParameter(element) {
    if(!element) {
        throw new TypeError("the parameter element is required.");
    }
}

//#region Form 表单

function dateChooser(element, option) {
    checkParameter(element);
    const $ = ui.$;
    return $(element).dateChooser(option);
}

function switchButton(element, option) {
    checkParameter(element);
    const $ = ui.$;
    return $(element).switchButton(option);
}

function confirmClick(element, option) {
    checkParameter(element);
    const $ = ui.$;
    return $(element).confirmClick(option);
}

function extendButton(element, option) {
    checkParameter(element);
    const $ = ui.$;
    return $(element).extendButton(option);
}

function filterButton(element, option) {
    checkParameter(element);
    const $ = ui.$;
    return $(element).filterButton(option);
}

function addHoverView(element, view) {
    checkParameter(element);
    const $ = ui.$;
    return $(element).addHoverView(view);
}

function createProgress(element, view) {
    checkParameter(element);
    const $ = ui.$;
    return $(element).progress(view);
}

function createSliderbar(element, view) {
    checkParameter(element);
    const $ = ui.$;
    return $(element).slidebar(view);
}

function createUploader(element, option) {
    checkParameter(element);
    const $ = ui.$;
    return $(element).uploader(option);
}

//#endregion

export {
    dateChooser,
    switchButton,
    confirmClick,
    extendButton,
    filterButton,
    addHoverView,
    createProgress,
    createSliderbar,
    createUploader
};