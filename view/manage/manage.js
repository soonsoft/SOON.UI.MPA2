import "./manage.css";

import ui from "../../src/soonui";
import { pageSettings, pageInit, bodyAppend, addFormFunctions, putToBag, getFromBag } from "../../src/layout/menu-layout";
import { createToolbarBuilder } from "../../src/component/toolbar";
import { createElement, css, append, addClass, text, on, prop } from "../../src/common/html/html-utils";
import { dateChooser, switchButton } from "../../src/common/ctrl/ctrl-utils";

pageSettings({
    title: "MANAGE",
    header: "SOON.UI MANAGE"
});

pageInit({
    menu: true,
    toolbar() {
        const element = createToolbarElement();
        return ui.Toolbar({
            toolbarId: element,
            defaultExtendShow: false
        });
    },
    created() {
        this.contentPanel = createContentPanel();
        this.gridView = createGridView(this.contentPanel);
        this.sidePanel = createSidePanel(this.contentPanel);
    },
    layout() {
        const height = this.contentBodyHeight;
        const toolbarHeight = this.toolbar.height;

        css(this.contentPanel, {
            height: (height - toolbarHeight) + "px"
        });
        if(this.gridView) {
            this.gridView.setSize(height - toolbarHeight);
        }
    },
    load() {
        loadMenuData();
        loadGridViewData();
    }
});

function createToolbarElement() {
    const toolbarBuilder = createToolbarBuilder();
    toolbarBuilder.addTools([
        {
            type: "actionButton",
            buttons: [
                {
                    id: "add",
                    text: "添加",
                    icon: "<i class='far fa-plus'></i>",
                    handler: function() {
                        if(ui.page.sidePanel) {
                            ui.page.sidePanel.onAdd();
                        }
                    }
                },
                {
                    id: "remove",
                    text: "删除",
                    icon: "<i class='far fa-minus'></i>",
                    handler: function() {
                        let selectionList = ui.page.gridView.getCheckedValues();
                        console.log(selectionList);
                        ui.messageShow("remove the selection data.");
                    }
                }
            ]
        }
    ], true);
    bodyAppend(toolbarBuilder.element);

    return toolbarBuilder.element;
}

function createContentPanel() {
    const element = createElement("div");
    css(element, {
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden"
    });
    bodyAppend(element);
    return element;
}

function createGridView(parentElement) {
    const element = document.createElement("div");
    append(parentElement, element);

    const gridview = ui.ctrls.GridView({
        columns: [
            { text: "#", align: "right", len: 60, formatter: ui.ColumnStyle.cfn.rowNumber },
            { text: ui.ColumnStyle.cnfn.checkAll, column: "id", align: "center", len: 40, formatter: ui.ColumnStyle.cfn.check },
            { text: "姓名", column: "name", len: 100 },
            { text: "年龄", column: "age", len: 100, align: "center" },
            { text: "电话", column: "phone", len: 120, align: "center", formatter: ui.ColumnStyle.cfn.cellPhone },
            { text: "状态", column: "status", len: 100, align: "center", formatter: ui.ColumnStyle.cfnp.getBooleanFormatter("启用", "禁用") },
            { text: "日期时间", column: "dateValue", len: 160, align: "center", formatter: ui.ColumnStyle.cfn.datetime },
            { formatter: ui.ColumnStyle.empty }
        ],
        selection: {
            type: "row",
            multiple: false,
            isRelateCheckbox: false
        }
    }, element);

    gridview.pagechanging(function(e, pageIndex, pageSize) {
        loadGridViewData(pageIndex);
    });
    gridview.rebind(function() {
        ui.page.sidePanel.hide();
    });
    gridview.selected(function(e, eventData) {
        ui.page.sidePanel.onUpdate(eventData.rowData);
    });
    gridview.deselected(function() {
        ui.page.sidePanel.hide();
    });

    return gridview;
}

function createSidePanel(parentElement) {
    function createButton(content) {
        let button = createElement("button");
        addClass(button, "button");
        css(button, {
            marginRight: "10px"
        });
        text(button, content);
        return button;
    }
    
    const saveButton = createButton("保 存");
    const cancelButton = createButton("取 消");
    addClass(saveButton, "background-highlight");

    const element = createFormElement();

    const sidePanel = ui.ctrls.OptionBox({
        parent: parentElement,
        title: "信息",
        width: 260,
        hasCloseButton: false,
        buttons: [saveButton, cancelButton]
    }, element);

    addFormFunctions(sidePanel, {
        fillForm: function(data) {
            let status = true;
            if(!data) {
                data = {};
            } else {
                status = !!data.status;
            }

            let element = document.getElementById("name");
            element.value = data.name || "";

            element = document.getElementById("age");
            element.value = data.age || "";

            element = document.getElementById("phone");
            element.value = data.phone || "";

            element = document.getElementById("dateValue");
            element.value = data.dateValue ? ui.date.format(data.dateValue, "yyyy-MM-dd HH:mm:ss") : "";

            let switchButton = getFromBag("status");
            switchButton.checked = status;
        },
        getFormData: function() {
            let data = {
                name: document.getElementById("name").value || null,
                age: parseInt(document.getElementById("age").value, 10) || null,
                phone: document.getElementById("phone").value || null,
                dateValue: ui.date.parse(document.getElementById("dateValue").value, "yyyy-MM-dd HH:mm:ss"),
                status: getFromBag("status").checked
            };
            return data;
        }
    });

    on(saveButton, "click", function() {
        console.log(sidePanel.getFormData());
        sidePanel.hide();
    });
    on(cancelButton, "click", function() {
        sidePanel.hide();
        ui.page.gridView.cancelSelection();
    });

    return sidePanel;
}

function createFormElement() {

    function createDataItem(parent, itemText, ctrlFn, isRequired, noBr) {
        let label = createElement("label");
        text(label, itemText);
        append(parent, label);
        
        if(isRequired) {
            let span = createElement("span");
            addClass(span, "required");
            text(span, "*");
            append(parent, span);
        }

        append(parent, createElement("br"));

        append(parent, ctrlFn());

        if(!noBr) {
            append(parent, createElement("br"));
        }
    }

    const element = createElement("div");
    addClass(element, "ui-form");
    css(element, {
        width: "230px",
        marginLeft: "15px"
    });

    // 姓名
    createDataItem(element, "姓名", () => {
        let input = createElement("input");
        prop(input, {
            id: "name",
            type: "text"
        });
        return input;
    }, true);

    // 年龄
    createDataItem(element, "年龄", () => {
        let input = createElement("input");
        prop(input, {
            id: "age",
            type: "text"
        });
        return input;
    });

    // 电话
    createDataItem(element, "电话", () => {
        let input = createElement("input");
        prop(input, {
            id: "phone",
            type: "text"
        });
        return input;
    });

    // 日期
    createDataItem(element, "日期", () => {
        let input = createElement("input");
        prop(input, {
            id: "dateValue",
            type: "text"
        });
        addClass(input, "ui-date-text");

        dateChooser(input, {
            //layoutPanel: element,
            isDateTime: true
        });

        return input;
    });

    // 状态
    createDataItem(element, "状态", () => {
        let input = createElement("input");
        prop(input, {
            id: "status",
            type: "checkbox",
            checked: true
        });

        let label = createElement("label");
        addClass(label, "ui-switch-text");
        text(label, "有效");
        prop(label, {
            for: input.id
        });

        let switchBtn= switchButton(input);
        switchBtn.changed(function() {
            if(this.checked) {
                this.switchBox.next().text("有效");
            } else {
                this.switchBox.next().text("无效");
            }
        });
        putToBag("status", switchBtn);

        return [switchBtn.switchBox, label];
    });

    append(element, createElement("br"));

    return element;
}

function loadMenuData() {
    ui.page.menu.setMenuList([
        {
            resourceCode: "1",
            resourceName: "HOME",
            icon: "/content/icon/sys-setting.png",
            url: "/",
            children: null
        }
    ]);
}

function loadGridViewData(pageIndex) {
    if(!ui.core.isNumber(pageIndex)) {
        ui.page.gridView.pageIndex = 1;
    }

    const viewData = [];
    for(let i = 0; i < 20; i++) {
        viewData.push({
            id: (i + 1) + (ui.page.gridView.pageIndex - 1) * ui.page.gridView.pageSize,
            name: "姓名" + (i + 1),
            age: ui.random.getNum(1, 150),
            dateValue: new Date(),
            phone: "18662718995",
            status: !!ui.random.getNum(0, 2)
        });
    }

    ui.page.gridView.createBody(viewData, 1052);
}