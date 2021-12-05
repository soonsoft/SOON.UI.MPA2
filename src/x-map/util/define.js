import ui from "../../soonui";

const namespace = "xmap";

function defineXMapComponent(name, base, prototype) {
    if(!ui.core.isString(name) || !name) {
        throw new TypeError("the parameter name is required.");
    }

    name = [namespace, ".", name].join("");

    return ui.ctrls.define(name, base, prototype);
}

export {
  defineXMapComponent
};