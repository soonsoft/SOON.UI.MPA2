import ui from "../../soonui";
import { defineXMapComponent } from "../util/define";
import MapToolPanel from "./map-tool-panel";

const $ = ui.$;

defineXMapComponent("MapLayerPanel", MapToolPanel, {
    _defineOption() {
        return {
            // 子元素格式化器
            layerFormatter: null,
            // 视图数据
            viewData: null,
            width: 200,
            height: "58%",
            left: 20
        };
    },
    _defineEvents() {
        return ["checked", "unchecked"];
    },
    _render() {
        this._super();
        this.toolPanel.addClass("layer-list");

        this.contextMenu = new ui.xmap.MapContextMenu({
            container: this.option.container
        });

        this.treeViewPanel = $("<div class='layer-content' />");
        this.treeView = new ui.ctrls.TreeView({
            valueField: "layerId",
            textField: "layerName",
            childField: "subLayers",
            defaultExpandLevel: false,
            nodeSelectable: true,
            multiple: true
        }, this.treeViewPanel);
        this.treeView.changed((e, eventData) => {
            const layerIdList = [];

            if (eventData.isNode) {
                this.treeView.selectChildNode(eventData.element, eventData.isSelection);
                if(eventData.isSelection) {
                    this.treeView.getSelection().forEach(function (item) {
                        if (!Array.isArray(item.subLayers)) {
                            layerIdList.push(item.layerId);
                        }
                    });
                } else {
                    ui.trans.treeEach(eventData.nodeData.subLayers, "subLayers", function(item)  {
                        if (!Array.isArray(item.subLayers)) {
                            layerIdList.push(item.layerId);
                        }
                    });
                }
            } else {
                layerIdList.push(eventData.nodeData.layerId);
            }
            if(eventData.isSelection) {
                this.fire("checked", layerIdList);
            } else {
                this.fire("unchecked", layerIdList);
            }
        });

        this.toolPanel.append(this.treeViewPanel);

        this.setViewData(this.option.viewData);
    },
    setViewData(data) {
        if(Array.isArray(data)) {
            this.treeView.setViewData(data);

            let checkedList = [];
            ui.trans.treeEach(data, "subLayers", function(item) {
                if(item.check || item.checked) {
                    checkedList.push(item.layerId);
                }
            });
            if(checkedList.length > 0) {
                this.treeView.setSelection(checkedList);
            }
        }
    },
    checkLayer(layerId) {
        if(Array.isArray(layerId)) {
            layerId = layerId[0];
        }
        this.treeView.setSelection(layerId);
    },
    uncheckLayer(layerId) {
        if(Array.isArray(layerId)) {
            layerId = layerId[0];
        }
        for(let i = this.treeView._selectList.length - 1; i >= 0; i--) {
            let elem = $(this.treeView._selectList[i]);
            let nodeData = this.treeView._getNodeData(elem);

            if(this.treeView._equalValue(nodeData, layerId)) {
                this.treeView._selectItem(elem, nodeData, false);
                break;
            }
        }
    }
});