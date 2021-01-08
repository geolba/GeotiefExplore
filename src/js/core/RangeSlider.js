import { EventEmitter } from './EventEmitter';
import * as dom from './domUtil';
import * as util from './utilities';
import * as domEvent from './domEvent';
import * as browser from './browser';

import './RangeSlider.css';

class RangeSlider extends EventEmitter {

    over = false;
    inDrag = false;
    touchCapable = false;

    options = {
        value: 0, // set default value on initiation from `0` to `100` (percentage based)
        vertical: false, // vertical or horizontal?
        orientation: "horizontal",
        rangeClass: "", // add extra custom class for the range slider track
        draggerClass: "",// add extra custom class for the range slider dragger
        selection: 'before',
        tooltip: 'show',
        handle: 'round',
        stepSize: 1
    };

    constructor(options) {
        super();

        util.setOptions(this, options);
        this.value = this.options.value;

        if (browser.touch && browser.mobile) {
            this.touchCapable = true;
        }        
    }

    addTo(parentDiv) {
        //this._initLayout();
        this.element = parentDiv;
        this.template = dom.createDom("div", {
            "class": 'slider', innerHTML:
                '<div class="range-slider-track">' +
                '<div class="slider-selection"></div>' +
                '<div class="slider-handle"></div>' +
                '<div class="slider-handle"></div>' +
                '</div>' +
                '<div class="slider-ticks"></div>' +
                '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'

        }, parentDiv);

        this.id = this.options.id;      
        this.tooltip = this.template.getElementsByClassName('tooltip')[0];
        this.tooltipInner = this.tooltip.getElementsByClassName('tooltip-inner')[0];
        this.sliderTrack = this.template.getElementsByClassName('range-slider-track')[0];
        this.sliderTicks = this.template.getElementsByClassName('slider-ticks')[0];


        this.orientation = this.options.orientation;

        if (this.orientation === "horizontal") {
            dom.addClass(this.template, "slider-horizontal");
            
            //.css('width', this.element.outerWidth());             
            //$(this.template).css('width', $(this.element).outerWidth());
            //this.template.style.width = this.element['offsetWidth'] + 'px';
            this.orientation = 'horizontal';
            this.stylePos = 'left';
            this.mousePos = 'pageX';
            this.sizePos = 'offsetWidth';
            //this.tooltip.addClass('top')[0].style.top = -this.tooltip.outerHeight() - 14 + 'px';
            dom.addClass(this.tooltip, "top");
            this.tooltip.style.top = -this.tooltip['offsetHeight'] - 14 + 'px';
        } else {
            dom.addClass(this.template, "slider-vertical");
            this.stylePos = 'top';
            this.mousePos = 'pageY';
            this.sizePos = 'offsetHeight';          
            dom.addClass(this.tooltip, "right");
            this.tooltip.style.left = "100%";
        }

        this.min = this.options.min;
        this.max = this.options.max;
        this.stepSize = this.options.stepSize;
        this.value = this.options.value;
        //if (this.value[1]) {
        //    this.range = true;
        //}

        let positionStep = 160 / 4;
        let topPosition = 0;
        for (let i = this.min; i <= this.max; i = i + this.stepSize) {
            let sliderTick = dom.createDom("div", {
                "class": 'slider-tick'
            }, this.sliderTicks);
            sliderTick.style.top = topPosition + 'px';
            topPosition = topPosition + positionStep;
        }

        this.selection = this.options.selection;
        this.selectionEl = this.template.getElementsByClassName('slider-selection')[0];
        if (this.selection === 'none') {
            dom.addClass(this.selectionEl, "hide");
        }
        this.selectionElStyle = this.selectionEl.style;

        this.handle1 = this.template.getElementsByClassName('slider-handle')[0];
        this.handle1Stype = this.handle1.style;
        this.handle2 = this.template.getElementsByClassName('slider-handle')[1];
        this.handle2Stype = this.handle2.style;

        var handle = this.options.handle;
        switch (handle) {
            case 'round':
                dom.addClass(this.handle1, "round");
                dom.addClass(this.handle2, "round");
                break;
            case 'triangle':
                dom.addClass(this.handle1, "triangle");
                dom.addClass(this.handle2, "triangle");
                break;
        }

        if (this.range) {
            this.value[0] = Math.max(this.min, Math.min(this.max, this.value[0]));
            this.value[1] = Math.max(this.min, Math.min(this.max, this.value[1]));
        }
        {
            this.value = [Math.max(this.min, Math.min(this.max, this.value))];
            //this.handle2.addClass('hide');
            dom.addClass(this.handle2, "hide");
            if (this.selection === 'after') {
                this.value[1] = this.max;
            } else {
                this.value[1] = this.min;
            }
        }

        this.diff = this.max - this.min;
        this.percentage = [
            (this.value[0] - this.min) * 100 / this.diff,
            (this.value[1] - this.min) * 100 / this.diff,
            this.stepSize * 100 / this.diff
        ];

        //this.offset = this.template.offset();
        // this.offset = $(this.template).offset();
        this.offset = this._getOffset(this.template);
        this.size = this.template[this.sizePos];
        //this.formater = options.formater;
        this.layout();


        // domEvent
        // .on(this.template, 'mousedown touchstart', domEvent.stopPropagation)
        // .on(this.template, 'click', domEvent.stopPropagation)
        // .on(this.template, 'dblclick', domEvent.stopPropagation)
        // .on(this.template, 'mousedown touchstart', domEvent.preventDefault)
        // .on(this.template, 'mousedown touchstart', this.mousedown, this);

        if (this.touchCapable) {
            // Touch: Bind touch events:	
            domEvent.on(this.template, 'touchstart', domEvent.stopPropagation)	
            domEvent.on(this.template, 'touchstart', domEvent.preventDefault);	
            domEvent.on(this.template, 'touchstart', this.mousedown, this);
        } else {
            domEvent.on(this.template, 'mousedown', domEvent.stopPropagation);
            domEvent.on(this.template, 'click', domEvent.stopPropagation);
            domEvent.on(this.template, 'dblclick', domEvent.stopPropagation);
            domEvent.on(this.template, 'mousedown', domEvent.preventDefault);
            domEvent.on(this.template, 'mousedown', this.mousedown, this);
        }



        // domEvent.on(this.template, "mousedown touchstart", this.mousedown, this);


        dom.addClass(this.tooltip, "hide");
    }

    layout() {
        this.handle1Stype[this.stylePos] = this.percentage[0] + '%';
        //this.handle2Stype[this.stylePos] = this.percentage[1] + '%';

        if (this.orientation == 'vertical') {
            this.selectionElStyle.top = Math.min(this.percentage[0], this.percentage[1]) + '%';
            this.selectionElStyle.height = Math.abs(this.percentage[0] - this.percentage[1]) + '%';
        } else {
            this.selectionElStyle.left = Math.min(this.percentage[0], this.percentage[1]) + '%';
            this.selectionElStyle.width = Math.abs(this.percentage[0] - this.percentage[1]) + '%';
        }

        //if (this.range) {
        //    this.tooltipInner.text(
        //		this.formater(this.value[0]) +
        //		' : ' +
        //		this.formater(this.value[1])
        //	);
        //    this.tooltip[0].style[this.stylePos] = this.size * (this.percentage[0] + (this.percentage[1] - this.percentage[0]) / 2) / 100 - (this.orientation === 'vertical' ? this.tooltip.outerHeight() / 2 : this.tooltip.outerWidth() / 2) + 'px';
        //} else {
        //    this.tooltipInner.text(
        //		this.formater(this.value[0])
        //	);
        //    this.tooltip[0].style[this.stylePos] = this.size * this.percentage[0] / 100 - (this.orientation === 'vertical' ? this.tooltip.outerHeight() / 2 : this.tooltip.outerWidth() / 2) + 'px';
        //}
    }

    _getOffset(element) {
        if (!element.getClientRects().length) {
            return { top: 0, left: 0 };
        }

        let rect = element.getBoundingClientRect();
        let win = element.ownerDocument.defaultView;
        return (
            {
                top: rect.top + win.pageYOffset,
                left: rect.left + win.pageXOffset
            });
    }

    mousedown(ev) {
        // Touch: Get the original event:
        // if (this.touchCapable && ev.type === 'touchstart') {
        //     ev = ev.originalEvent;
        // }

        //this.offset = this.template.offset();
        // this.offset = $(this.template).offset();
        this.offset = this._getOffset(this.template);

        this.size = this.template[this.sizePos];

        let percentage = this.getPercentage(ev);

        if (this.range) {
            // var diff1 = Math.abs(this.percentage[0] - percentage);
            // var diff2 = Math.abs(this.percentage[1] - percentage);
            // this.dragged = (diff1 < diff2) ? 0 : 1;
        }
        else {
            this.dragged = 0;
        }

        // this.percentage[this.dragged] = percentage;
        // this.layout();

        if (this.touchCapable) {
            // Touch: Bind touch events:          
            domEvent.on(this.template, 'touchmove', this.mousemove, this);
            domEvent.on(this.template, 'touchend', this.mouseup, this);
            // domEvent.on(this.template, 'touchcancel', this.onMouseLeave, this);
        } else {
            domEvent.on(this.template, 'mousemove', this.mousemove, this);
            domEvent.on(this.template, 'mouseup', this.mouseup, this);
            domEvent.on(this.template, 'mouseleave', this.onMouseLeave, this);
        }

        this.inDrag = true;
        // let value = this.calculateValue();
        //if (this.options.inverse === true) {
        //    val = val * -1;
        //}
        // this.emit("slide", { value: value });

        // this.percentage[this.dragged] = percentage;
        if (this.percentage[this.dragged] != percentage) {
            this.percentage[this.dragged] = percentage;
            this.layout();
            let value = this.calculateValue();
            this.emit("slide", value);
        }

        return false;
    }

    mousemove(ev) {
        this.handle1.style.cursor = "grab";
        this.sliderTrack.style.cursor = "grab";

        // Touch: Get the original event:
        // if (this.touchCapable && ev.type === 'touchmove') {
        //     ev = ev.originalEvent;
        // }

        let percentage = this.getPercentage(ev);
        // if (this.range) {
        //     if (this.dragged === 0 && this.percentage[1] < percentage) {
        //         this.percentage[0] = this.percentage[1];
        //         this.dragged = 1;
        //     } else if (this.dragged === 1 && this.percentage[0] > percentage) {
        //         this.percentage[1] = this.percentage[0];
        //         this.dragged = 0;
        //     }
        // }

        // this.percentage[this.dragged] = percentage;
        if (this.percentage[this.dragged] != percentage) {
            this.percentage[this.dragged] = percentage;
            this.layout();
            let value = this.calculateValue();
            this.emit("slide", value);
        }
        //if (this.options.inverse === true) {
        //    val = val * -1;
        //}

        // this.layout();
        // let value = this.calculateValue();     

        return false;
    }

    mouseup(ev) {
        this.handle1.style.cursor = "pointer";
        this.sliderTrack.style.cursor = "pointer";



        if (this.touchCapable) {
            // Touch: Bind touch events:           
            domEvent.off(this.template, "touchmove", this.mousemove, this);
            domEvent.off(this.template, 'touchend', this.mouseup, this);
            // domEvent.off(this.template, 'touchcancel', this.onMouseLeave, this);
        } else {
            domEvent.off(this.template, "mousemove", this.mousemove, this);
            domEvent.off(this.template, 'mouseup', this.mouseup, this);
            domEvent.off(this.template, 'mouseleave', this.onMouseLeave, this);
        }

        this.inDrag = false;
        //if (this.over == false) {
        //    this.hideTooltip();
        //}
        this.element;
        let value = this.calculateValue();
        this.emit('onChange', { value: value, status: 'ok' });
        return false;
    }

    onMouseLeave() {
        this.handle1.style.cursor = "pointer";
        this.sliderTrack.style.cursor = "pointer";


        if (this.touchCapable) {
            // Touch: Bind touch events:           
            domEvent.off(this.template, "touchmove", this.mousemove, this);
            domEvent.off(this.template, 'touchend', this.mouseup, this);
            // domEvent.off(this.template, 'touchcancel', this.onMouseLeave, this);
        } else {
            domEvent.off(this.template, "mousemove", this.mousemove, this);
            domEvent.off(this.template, 'mouseup', this.mouseup, this);
            domEvent.off(this.template, 'mouseleave', this.onMouseLeave, this);
        }

        this.inDrag = false;

        //also change border geometry
        let value = this.calculateValue();
        this.emit('onChange', { value: value, status: 'ok' });
    }

    calculateValue() {
        var val;
        if (this.range) {
            val = [
                (this.min + Math.round((this.diff * this.percentage[0] / 100) / this.stepSize) * this.stepSize),
                (this.min + Math.round((this.diff * this.percentage[1] / 100) / this.stepSize) * this.stepSize)
            ];
            this.value = val;
        } else {
            val = (this.
                min + Math.round((this.diff * this.percentage[0] / 100) / this.stepSize) * this.stepSize);
            this.value = [val, this.value[1]];
        }
        return val;
    }

    getPercentage(ev) {
        if (this.touchCapable && ev.touches) {
            ev = ev.touches[0];      
        }
        let percentage = (ev[this.mousePos] - this.offset[this.stylePos]) * 100 / this.size;
        percentage = Math.round(percentage / this.percentage[2]) * this.percentage[2];
        return Math.max(0, Math.min(100, percentage));
    }

    getValue() {
        if (this.range) {
            return this.value;
        }
        return this.value[0];
    }

    setValue(val) {
        this.value = val;

        if (this.range) {
            this.value[0] = Math.max(this.min, Math.min(this.max, this.value[0]));
            this.value[1] = Math.max(this.min, Math.min(this.max, this.value[1]));
        } else {
            this.value = [Math.max(this.min, Math.min(this.max, this.value))];
            this.handle2.addClass('hide');
            if (this.selection === 'after') {
                this.value[1] = this.max;
            } else {
                this.value[1] = this.min;
            }
        }
        this.diff = this.max - this.min;
        this.percentage = [
            (this.value[0] - this.min) * 100 / this.diff,
            (this.value[1] - this.min) * 100 / this.diff,
            this.stepSize * 100 / this.diff
        ];
        this.layout();
    }

}

export { RangeSlider };