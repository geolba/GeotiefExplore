// import { Component, Vue } from "vue-property-decorator";
import * as dom from "../core/domUtil";
import * as domEvent from "../core/domEvent";
import * as util from "../core/utilities";

import "./ShowModal.css";

// @Component({})
export default class Modal {
    defaultTitle = "3DViewer";
    declaredClass = "MobileDialog";
    options = {};

    constructor(title, parentContainer, options = {}) {
        // super(options);
        util.setOptions(this, options);

        this.title = title ? title : this.defaultTitle;
        this.options = options || this.default;

        this.init(parentContainer);
    }

    init(parentContainer) {
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
        let dialogHtml = `
        <div class="modal-backdrop">
            <div
                class="modal"
                role="dialog"
                aria-labelledby="modalTitle"
                aria-describedby="modalDescription"
            >
                <header class="modal-header" id="modalTitle">               
                <slot name="header">
                ${this.title}
                    <button
                    type="button"
                    class="btn-close"
                    id="btn-close"
                    v-on:click="close"
                    aria-label="Close modal"
                    >
                    x
                    </button>
                </slot>
                </header>
                <section class="modal-body" id="modalDescription">
                <slot name="body">I'm the default body!</slot>
                </section>
                <section class="modal-body" id="additionalDescription">               
                </section>
                <footer class="modal-footer">
                <slot name="footer">                 
                </slot>
                </footer>
            </div>
        </div>
        `;


        this.domNode = dom.createDom("div", { class: "popup" }, container);
        this.dialogDiv = dom.createDom("div", { class: this.options.klass + " fm_overlay hide", innerHTML: dialogHtml }, container);
        this.popupcontent = dom.byId("modalDescription");
        //additional info div
        this.pageinfo = dom.byId("additionalDescription");
        let popup_close = dom.byId("btn-close");

        domEvent.on(popup_close, 'click', domEvent.preventDefault);
        domEvent.on(popup_close, 'click', domEvent.stopPropagation);
        domEvent.on(popup_close, 'click', this.hide, this);
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

        if (!isHelp) {
            //document.getElementById("pageinfo").style.display = "none";
            this.pageinfo.style.display = "none";
        }
        else {
            this.pageinfo.innerHTML = `
                <div id="about">
                This project is using the following libraries, fonts & styles:
                <ul>

                <li>three.js + OrbitControls.js <a href="https://threejs.org/" target="_blank">threejs.org</a>
                <a href="https://github.com/mrdoob/three.js/blob/dev/LICENSE" target="_blank" class="license">MIT LICENSE</a></li>

                <li id="lib_proj4js">Proj4js <a href="https://github.com/proj4js/proj4js" target="_blank">github.com/proj4js/proj4js</a>
                <a href="https://github.com/proj4js/proj4js/blob/master/LICENSE.md" target="_blank" class="license">Proj4js -- Javascript reprojection library</a></li>

                <li id="lib_normalize">normalize.css <a href="https://github.com/necolas/normalize.css" target="_blank">github.com/necolas/normalize.css</a>
                <a href="https://github.com/necolas/normalize.css/blob/master/LICENSE.md" target="_blank" class="license">MIT License</a></li>

                <li id="lib_fontawesome">Font Awesome Free <a href="https://github.com/FortAwesome/Font-Awesome" target="_blank">github.com/FortAwesome/Font-Awesome</a>
                <a href="https://github.com/FortAwesome/Font-Awesome/blob/master/LICENSE.txt" target="_blank" class="license">Font: SIL OFL 1.1, CSS: MIT License, Icons: CC BY 4.0 License</a></li>

                </ul>
                </div>`;
            this.pageinfo.style.display = "block";
        }

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




