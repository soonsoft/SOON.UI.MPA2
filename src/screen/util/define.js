import ui from "../../soonui";

const namespace = "screen";
const moduleNamespace = "ui.screen.module";

function defineScreenModule(name, base, prototype) {
    if(!ui.core.isString(name) || !name) {
        throw new TypeError("the parameter name is required.");
    }

    name = [moduleNamespace, ".", name].join("");

    return ui.define(name, base, prototype);
}

function defineScreenComponent(name, base, prototype) {
    if(!ui.core.isString(name) || !name) {
        throw new TypeError("the parameter name is required.");
    }

    name = [namespace, ".", name].join("");

    return ui.ctrls.define(name, base, prototype);
}

export {
    defineScreenModule,
    defineScreenComponent  
};