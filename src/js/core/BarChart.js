import * as dom from '../core/domUtil';

export class BarChart {

    /**
     * constructor: BarChart
     */
    constructor(color, val, valcolor, render, valHeight) {

        // The render type - can be light and full
        this.renderType = render;
        // the 3D object for the text label
        this.labelobj = null;
        // should we set the wireframe
        this.hasWireframe = false;
        this.val = val;
        ////this.h = 0.5;

        //// rows and column titles
        //this.titles = titles;

        // main cube colour
        this.color = parseInt(color, 16);
        this.htmlcolor = "#" + color;
        //this.lumcolor = colorLuminance(color, 0.5);
        //this.darklumcolor = colorLuminance(color, -0.3);
        this.valcolor = parseInt(valcolor, 16);

        this.alignRight = false;

        //var container = this._container = dom.createDom("table", { "class": "chartTable" });
        //var _tbody = dom.createDom("tbody", {}, this._container);

        this.width = 300;
        this.height = valHeight;// 400;
        this.maxValue;
        this.margin = 100;
        this.colors = ["purple", "red", "green", "yellow"];
        this.curArr = [];
        this.backgroundColor = "#fff";
        this.xAxisLabelArr = ["Bohrloch"];
        this.yAxisLabelArr = ["34"];
        //this.animationInterval = 100;
        //this.animationSteps = 10;
        this._container = dom.createDom("canvas", { "class": "chartCanvas" });

    }

    addBar(barHeight, color, name) {
        barHeight = barHeight;//*1.5;
        // Simple cube geometry for the bar
        // Parameter 1 : width
        // Parameter 2 : height
        // Parameter 3 : depth
        let barColor = "";
        if (typeof color === "string") {
            barColor = color;
        }
        else {
            barColor = "#" + this._zfill(color.toString(16), 6); //webservicelayer.materialParameter[0].color;
        }


        let _tr = dom.createDom("tr", { style: "width:100px;" }, this._container);
        let _profileColumn = dom.createDom("td", {}, _tr);
        //var span = dom.createDom("span", { "class": "tooltip", title: "Beschreibung...", innerHTML: " info" }, _td);
        dom.createDom("div", {
            style: "width:25px;height:" + barHeight + "px;background-color:" + barColor + ";",
            //innerHTML: name
        }, _profileColumn);
        //this._container.insertBefore(_tr, this._container.firstChild);


        let _lableColumn = dom.createDom("td", {}, _tr);
        let lable = dom.createDom("div", {
            innerHTML: name,
            style: "width:75px;height:" + barHeight + "px;"
        }, _lableColumn);
    }

    draw(arr) {
        //this._container.innerHTML = "";
        let numOfBars = 1;// arr.length;
        let barWidth;
        let barHeight;
        let border = 0;
        let ratio;
        let maxBarHeight;
        let gradient;
        let largestValue = 0;
        let graphAreaX = 0;
        let graphAreaY = 0;
        let graphAreaWidth = this.width;
        let graphAreaHeight = this.height;
        let i;
        let ctx = this._container.getContext("2d");

        // Update the dimensions of the canvas only if they have changed
        if (ctx.canvas.width !== this.width || ctx.canvas.height !== this.height) {
            ctx.canvas.width = this.width; //300
            ctx.canvas.height = this.height; //400
        }
        //// Draw the background color white
        //ctx.fillStyle = this.backgroundColor;
        //ctx.fillRect(0, 0, this.width, this.height);

        // If x axis labels exist then make room	
        if (this.xAxisLabelArr.length) {
            graphAreaHeight -= 40;
        }

        // Calculate dimensions of the bar
        barWidth = 15;// graphAreaWidth / numOfBars - this.margin * 2;
        maxBarHeight = graphAreaHeight - 25;//300

        // Determine the largest value in the bar array
        // let largestValue = 0;
        // for (i = 0; i < arr.length; i += 1) {
        //     if (arr[i].dist > largestValue) {
        //         largestValue = arr[i].dist;
        //     }
        // }   
        largestValue = Math.max.apply(Math, arr.map(o => o.dist));

        let maxValue = Math.max.apply(Math, arr.map(o => o.max));
        this.maxValue = Math.round(maxValue);
        let minValue = Math.min.apply(Math, arr.map(o => o.min));
        this.minValue = Math.round(minValue);
        // let smallestValue = Math.min.apply(Math, arr.map(o => o.dist));
        let totalHeight = this.totalHeight = this.maxValue - this.minValue; //6000;

        //// Draw grey bar background
        //ctx.fillStyle = "lightgray";
        //ctx.fillRect(this.margin,
        //  graphAreaHeight - maxBarHeight,
        //  barWidth,
        //  maxBarHeight);

        // For each bar
        for (let i = 0; i < arr.length; i++) {

            let color = arr[i].color;
            let barColor = "";
            if (typeof color === "string") {
                barColor = "#" + color;
            }
            else {
                barColor = "#" + this._zfill(color.toString(16), 6); //webservicelayer.materialParameter[0].color;
            }

            //// Set the ratio of current bar compared to the maximum
            //if (this.maxValue) {
            //    ratio = arr[i].dist / this.maxValue;
            //} else {
            //    ratio = arr[i].dist / largestValue;
            //}
            ratio = arr[i].dist / totalHeight;

            // //barHeight = arr[i].dist;// ratio * maxBarHeight;
            // barHeight = parseInt((maxBarHeight / 6000) * arr[i].dist);
            barHeight = parseInt(ratio * maxBarHeight);
            let x = this.margin;// this.margin + i * this.width / numOfBars
            let y = graphAreaHeight - barHeight;
            if (i == 0) {
                this.startPointY = y + (barHeight);
            }

            // Draw bar color if it is large enough to be visible
            if (barHeight > border * 2) {
                ctx.fillStyle = barColor;// gradient;
                // Fill rectangle with gradient
                ctx.fillRect(x + border,
                    y + border,
                    barWidth - border * 2,
                    barHeight - border * 2);
            }


            // Write bar value
            if (barHeight > border + 9) {
                ctx.fillStyle = "#333";
                ctx.font = "bold 9px sans-serif";
                //ctx.textAlign = "center";
                // Use try / catch to stop IE 8 from going to error town
                try {
                    if (arr[i].name !== "Basement") {
                        ctx.fillText(arr[i].name + ": " + Math.round(arr[i].dist) + " m", //.toFixed(2),
                            //i * this.width / numOfBars + (this.width / numOfBars) / 2,
                            x + 30,
                            y + (barHeight / 2) + 4.5);
                    }
                    else {
                        ctx.fillText(arr[i].name,//.toFixed(2),                             
                            x + 30,
                            y + (barHeight / 2) + 4.5);
                    }
                }
                catch (ex) { }
            }

            graphAreaHeight = graphAreaHeight - (barHeight - (border / 2));
        }//end for-loop

        if (this.startPointY) {
            ctx.beginPath();
            ctx.moveTo(20, this.startPointY);
            ctx.lineTo(20, this.startPointY - maxBarHeight);

            let startPoint = this.startPointY;
            let stepSize = this.totalHeight / 10; // arr.length;
            let item = this.minValue;
            do {
                let dist = (maxBarHeight / this.totalHeight) * stepSize;
                ctx.moveTo(20, startPoint);
                ctx.lineTo(40, startPoint);
                ctx.font = "10px Arial";
                ctx.strokeText(Math.round(item), 55, startPoint + 2.5);
                startPoint = startPoint - dist;
                item += stepSize;
                // console.log(item);
            } while (item < this.maxValue + 1);

            //ctx.lineTo(70, 100);
            ctx.stroke();
        }
    }

    getStatTable(arr) {
        let chartContainer = dom.createDom("div", { class: "chartContainer"});
        let statTable = dom.createDom("table", { "class": "chartTable" }, chartContainer);
        let _headerRow = dom.createDom("tr", { style: "width:100px;" }, statTable);
        let _profileHeaderColumn = dom.createDom("th", {}, _headerRow);
        let _lableHeaderColumn = dom.createDom("th", {}, _headerRow);
        let _minHeaderColumn = dom.createDom("th", {}, _headerRow);
        dom.createDom("div", {
            innerHTML: "bottom <br /> (m)",
            style: "width:75px;"
        }, _minHeaderColumn);
        let _maxHeaderColumn = dom.createDom("th", {}, _headerRow);
        dom.createDom("div", {
            innerHTML: "top <br /> (m)",
            style: "width:75px;"
        }, _maxHeaderColumn);

        // For each bar
        //for (var i = 0; i < arr.length; i++) {
        for (let i = arr.length - 1; i >= 0; i--) {

            let color = arr[i].color;
            let barColor = "";
            if (typeof color === "string") {
                barColor = color;
            }
            else {
                barColor = "#" + this._zfill(color.toString(16), 6); //webservicelayer.materialParameter[0].color;
            }
            let _tr = dom.createDom("tr", { style: "width:100px;" }, statTable);

            let _profileColumn = dom.createDom("td", {}, _tr);
            let geometry = dom.createDom("div", {
                style: "width:20px;height:20px;background-color:" + barColor + ";",
                //innerHTML: name
            }, _profileColumn);

            let _lableColumn = dom.createDom("td", {}, _tr);
            let lable = arr[i].name.replace("_"," ");
            dom.createDom("div", {
                innerHTML: lable,
                // style: "width:75px;",
                class: "layerNameColumn"
            }, _lableColumn);

            let _minColumn = dom.createDom("td", {}, _tr);
            //für den Layer Basement keine Unterkante
            let minLable = "";
            if (arr[i].name !== "Basement") {
                minLable = dom.createDom("div", {
                    innerHTML: Math.round(arr[i].min),//.toFixed(2),
                    style: "width:75px;"
                }, _minColumn);
            }
            else {
                minLable = dom.createDom("div", {
                    innerHTML: "x",
                    style: "width:75px;"
                }, _minColumn);
            }

            let _maxColumn = dom.createDom("td", {}, _tr);
            let maxLable = dom.createDom("div", {
                innerHTML: Math.round(arr[i].max),//.toFixed(2),
                style: "width:75px;"
            }, _maxColumn);

        }
        return chartContainer;
    }

    _zfill(num, len) {
        return (Array(len).join("0") + num).slice(-len);
    }

    // function to show the label
    showLabel(posx, posy) {
        // Shows 3D label if set
        if (this.hasLabel) {
            this.labelobj.visible = true;
        }

        // Shows HTML Label if set - uses jquery for DOM manipulation
        if (this.hasHTMLLabel) {
            this.hasHTMLLabel.html(this.titles.row +
                '<p>' + this.titles.col + ': ' + val + '</p>');
            this.hasHTMLLabel.show();
            // Back transformation of the coordinates
            posx = ((posx + 1) * window.innerWidth / 2);
            posy = -((posy - 1) * window.innerHeight / 2);
            this.hasHTMLLabel.offset({ left: posx, top: posy });
        }
    }

    // function to hide the label
    hideLabel() {
        // Hides 3D label if set
        if (this.hasLabel) {
            this.labelobj.visible = false;
        }
    }

}