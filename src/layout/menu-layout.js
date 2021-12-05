import { pageSettings, pageInit, addFormFunctions, putToBag, getFromBag } from "./layout-master";
import { append } from "../common/html/html-utils";

function bodyAppend(element) {
    if(!element) {
        return;
    }
    let contentBody = ui.page.body[0];
    contentBody = contentBody.getElementsByClassName("content-container");
    if(contentBody.length > 0) {
        append(contentBody[0], element);
    }
}

export {
    pageSettings,
    pageInit,
    bodyAppend,
    addFormFunctions,
    putToBag,
    getFromBag
}