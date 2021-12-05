import ui from "../../../soonui";
import * as echarts from "echarts";
import { defineScreenModule } from "../../util/define";
import LayoutBaseModule from "./layout-base-module";

const $ = ui.$;
const defaultChartColors = [
    "#FA3769",
    "#FFC828",
    "#61A2E5",
    "#44BEC3",
    "#0ABF1C",
    "#F2CB57",
    "#4BD9FF",
    "#A4D8B2",
    "#FE5A3E",
    "#6E9AEF",
    "#BEB9FA",
    "#FFABAF",
    "#8CBAD1"
];


// 柱状图面板
const LayoutChartBarPanel = defineScreenModule("LayoutChartBarPanel", LayoutBaseModule, {
    _createContent() {
        var content = $("<div style='width:100%;height:100%;overflow:hidden' />");
        return content;
    },
    _initPanel() {
        this.highlightColor = ui.theme.currentHighlight.Color;
        this.chartColors = this.option.chartColors || defaultChartColors;
        this.resize(e => {
            this.panelContent.css({
                width: "100%",
                height: "100%"
            });
            if(this.panel.chartView) {
                this.panel.chartView.resize({
                    width: this.panel.contentWidth,
                    height: this.panel.contentHeight
                });
            }
        });

        this.showing(e => {
            this.panelContent.css({
                width: this.panel.contentWidth + "px",
                height: this.panel.contentHeight + "px"
            });
            if(!this.panel.chartView) {
                this.panel.chartView = echarts.init(this.panelContent.get(0));
            }

            let chartOption = this._getChartOption(this.chartColors, this.highlightColor);
            this.panel.chartView.setOption(chartOption);
            if(Array.isArray(this.option.viewData) && this.option.viewData.length > 0) {
                this.setViewData(this.option.viewData);
            }
        });
    },
    _getChartOption(chartColors, highlightColor) {
        return {
            title: {
                show: false
            },
            tooltip: {},
            legend: {
                show: false
            },
            grid: {
                top: "15",
                right: "15"
            },
            xAxis: {
                axisLine: {
                    lineStyle: {
                        color: highlightColor
                    }
                },
                splitLine: {
                    show: false
                },
                axisLabel: {
                    rotate: 60
                },
                data: []
            },
            yAxis: {
                axisLine: {
                    lineStyle: {
                        color: highlightColor
                    }
                },
                splitLine: {
                    show: false
                },
                axisTick: {
                    show: false
                }
            },
            series: []
        };
    },
    _createValueItem(name, value, index) {
        let colors = this.chartColors;
        return {
            name: name,
            value: value,
            itemStyle: {
                color: colors[index]
            }
        };
    },
    _getCategories() {
        let categories = this.option.categories || this.categories;
        if(Array.isArray(categories)) {
            return categories;
        }
        
        let viewData = this.option.viewData || [];
        if(viewData.length > 0) {
            let map = {};
            viewData.forEach(function(item) {
                map[item[categoryColumn]] = 1;
            });
            this.categories = Object.keys(map);
            return this.categories;
        }
        return [];
    },
    _getData(viewData) {
        const data = [];
        const categoryMap = {};
        const categories = [];
            
        const categoryColumn = this.option.categoryColumn;
        const valueColumn = this.option.valueColumn;
        
        if(viewData.length > 0) {
            viewData.forEach(item => {
                var category = item[categoryColumn];
                data.push(this._createValueItem(category, item[valueColumn], categories.length, item));
                if(!categoryMap[category]) {
                    categoryMap[category] = 1;
                    categories.push(category);
                }
            });
            if(!Array.isArray(this.option.categories)) {
                this.categories = categories;
            }
        }

        return data;
    },
    _getSeries() {
        const highlightColor = this.highlightColor;
        const data = this._getData(this.option.viewData || []);

        return [
            {
                type: 'bar',
                barWidth: 20,
                itemStyle: {
                    color: highlightColor,
                    barBorderRadius: [10, 10, 0, 0]
                },
                label: {
                    show: true,
                    position: "top"
                },
                barMinHeight: "5%",
                data: data
            }
        ];
    },
    setViewData(viewData) {
        this.option.viewData = viewData;
        if(this.panel && this.panel.chartView) {
            let series = this._getSeries();
            let categories = this._getCategories();
            this.panel.chartView.setOption({
                xAxis: {
                    data: categories
                },
                series: series
            });
        }
    }
});

// 折线图面板
defineScreenModule("LayoutChartLinePanel", LayoutChartBarPanel, {
    _getChartOption(chartColors, highlightColor) {
        return {
            color: chartColors,
            title: {
                show: false
            },
            tooltip: {},
            legend: {
                show: false
            },
            grid: {
                top: "15",
                right: "15",
                bottom: "30"
            },
            xAxis: {
                type: 'category',
                axisLine: {
                    lineStyle: {
                        color: highlightColor
                    }
                },
                splitLine: {
                    show: false
                },
                data: []
            },
            yAxis: {
                type: 'value',
                axisLine: {
                    lineStyle: {
                        color: highlightColor
                    }
                },
                splitLine: {
                    show: false
                },
                axisTick: {
                    show: false
                }
            },
            series: []
        };
    },
    _createValueItem(name, value, index, item) {
        return {
            name: name,
            value: value,
            group: item[this.option.groupColumn]
        };
    },
    _getSeries() {
        const series = [];
        const seriesMap = {};

        let data = this._getData(this.option.viewData || []);
        data.forEach(function(item) {
            var group = item.group;
            delete item.group;
            if(!seriesMap[group]) {
                seriesMap[group] = {
                    name: group,
                    type: 'line',
                    smooth: true,
                    lineStyle: {
                        width: 2,
                        type: "solid"
                    },
                    label: {
                        show: false
                    },
                    data: [item]
                };
            } else {
                seriesMap[group].data.push(item);
            }
        });

        Object.keys(seriesMap).forEach(function(key) {
            series.push(seriesMap[key]);
        });
        return series;
    }
});

// 环状图面板
defineScreenModule("LayoutChartPiePanel", LayoutChartBarPanel, {
    _getChartOption(chartColors, highlightColor) {
        return {
            color: chartColors,
            title: {
                show: false
            },
            tooltip: {
                show: false,
                trigger: "item",
                formatter: "{a} <br/>{b}: {c} ({d}%)"
            },
            legend: {
                orient: "horizontal",
                bottom: "0px",
                textStyle: {
                    color: highlightColor
                },
                data: []
            },
            series: []
        };
    },
    _createValueItem(name, value) {
        return {
            name: name,
            value: value
        };
    },
    _getSeries() {
        let data = this._getData(this.option.viewData || []);
        return [{
            type: "pie",
            radius: ["50%", "70%"],
            avoidLabelOverlap: false,
            center: ["50%", "40%"],
            label: {
                normal: {
                    show: false,
                    position: "center",
                    formatter: "{b}\n{c}\n({d}%)"
                },
                emphasis: {
                    show: true,
                    textStyle: {
                        fontSize: "16",
                        fontWeight: "bold"
                    }
                }
            },
            labelLine: {
                normal: {
                    show: false
                }
            },
            data: data
        }];
    },
    setViewData(viewData) {
        this.option.viewData = viewData;
        if(this.panel && this.panel.chartView) {
            let series = this._getSeries();
            let categories = this._getCategories();
            this.panel.chartView.setOption({
                legend: {
                    data: categories
                },
                series: series
            });
        }
    }
});