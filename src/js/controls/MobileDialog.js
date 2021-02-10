// import { Control } from "./Control";
import * as dom from '../core/domUtil';
import * as domEvent from '../core/domEvent';
import * as util from '../core/utilities';

import './MobileDialog.css';

export class MobileDialog {

    defaultTitle = '3DViewer';
    declaredClass = "MobileDialog";
    options = { };

    constructor(title, parentContainer, options = {}) {
        // super(options);
        util.setOptions(this, options);

        this.title = title ? title : this.defaultTitle;
        this.options = options || this.defaultOptions;
        this.init(parentContainer);
    }

    init(parentContainer) {
        // this.map = map;

        let className = "gba-basemap-control";
        let container;
        let toggleable = false;

        if (this.options.position) {
            container = this._container = dom.createDom("div", { "class": className });
            toggleable = true;

        } else {
            container = this._container = parentContainer;
            // dom.addClass(container, className);
            toggleable = false;

        }

        this.domNode = dom.createDom("div", { class: "popup" }, container);
        this.dialogDiv = dom.createDom("div", {
            //class: "fm_basemap_list fm_overlay", 
            //class: "fm_about fm_overlay", 
            class: this.options.klass + " fm_overlay hide"
        }, this.domNode);

        

        //popupbar
        this.popupbar = dom.createDom("div", { 'class': "popupbar" }, this.dialogDiv);
        this.popuptitle = dom.createDom("b", { 'class': "popuptitle" }, this.popupbar);
        let popup_close = dom.createDom("div", { 'class': "popup_close" }, this.popupbar);
        this.popuptitle.innerHTML = this.title;

        //popupcontent
        this.popupcontent = dom.createDom("div", { 'class': "fm_handle" }, this.dialogDiv);

        //additional info div
        this.pageinfo = dom.createDom("div", {
            'class': "pageinfo"
        }, this.dialogDiv);

        domEvent.on(popup_close, 'click', domEvent.preventDefault);
        domEvent.on(popup_close, 'click', domEvent.stopPropagation);
        domEvent.on(popup_close, 'click', this.hide, this);

        if (this.options.position) {
            return container;
        }
    }

    hide(e) {
        this.dialogDiv.classList.add('hide');
        this.dialogDiv.classList.remove('show');
    }

    show(html) {
        let isHelp = html === undefined ? true : false;

        if (html === undefined) {
            html = this._help();          
        }

        if (html instanceof HTMLElement) {
            this.popupcontent.innerHTML = "";
            this.popupcontent.appendChild(html);
        }
        else {
            this.popupcontent.innerHTML = html;
        }

        // this.domNode.getElementsByClassName("popuptitle")[0].innerHTML = title || this.title;

        // if (!isHelp) {
        //     //document.getElementById("pageinfo").style.display = "none";
        //     this.pageinfo.style.display = "none";
        // }
        // else {
        //     //document.getElementById("pageinfo").style.display = "block";
        //     this.pageinfo.style.display = "block";
        // }

        this.dialogDiv.classList.add('show');
        this.dialogDiv.classList.remove('hide');
    }

    _help() {
        let html = "";
        //var imagePath = $UrlHelper.resolve('~') + "content/img/";
        let imagePath = "images/map/";
        let list = '<ul><li id="leftMouse"><img src=' + imagePath + 'leftMouse.png> Rotate 3D Model</li>' +
            '<li id="middleMouse"><img src=' + imagePath + 'middleMouse.png> Zoom 3D Model</li>' +
            '<li id="rightMouse"><img src=' + imagePath + 'rightMouse.png> Pan 3D Model</li></ul>';
        html += list;
        return html;
    }


}

