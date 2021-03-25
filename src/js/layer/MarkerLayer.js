import { Layer } from './Layer';
import * as util from '../core/utilities';
import { BaseEditor } from '../core/BaseEditor';
import { CylinderGeometry } from 'three/src/geometries/CylinderGeometry';
import { MeshLambertMaterial } from 'three/src/materials/MeshLambertMaterial';
import { MathUtils } from 'three/src/math/MathUtils';
import { Mesh } from 'three/src/objects/Mesh';

export class MarkerLayer extends Layer {

    constructor(latlng, options) {
        super();
        util.setOptions(this, options);
        this._latlng = latlng;

    }

    createEditor(map) {
        map = map || this._map;
        var Klass = this.options.editorClass || this.getEditorClass(map);
        return new Klass(map, this, this.options.editOptions);
    }

    enableEdit(map) {
        if (!this.editor) {
            this.createEditor(map);
        }
        return this.editor.enable();
    }

    getEditorClass(map) {
        return BaseEditor;
    }

    options = {
        pane: 'markerPane',
        nonBubblingEvents: ['click', 'dblclick', 'mouseover', 'mouseout', 'contextmenu'],
        //icon: new L.Icon.Default(),         
        opacity: 1,
        clickable: true,
    };



    onAdd(map) {
        //this._zoomAnimated = this._zoomAnimated && map.options.markerZoomAnimation;
        this.map = map;
        this._initIcon();
        this.update();
        this.emit('add');
    }

    onRemove() {
        //if (this.dragging && this.dragging.enabled()) {
        //    this.options.draggable = true;
        //    this.dragging.removeHooks();
        //}

        this._removeIcon();
        //this._removeShadow();
        this.emit('remove');
        this._map = null;
    }

    update() {
        if (this._icon) {
            var pos = this._latlng;
            this._setPos(pos);
        }
        this._map.emit("change");
        return this;
    }

    getElement() {
        return this._icon;
    }

    _initIcon() {
        //create default icon
        let options = { r: 0.25, c: 0xffff00, o: 0.8 };
        let icon = new Mesh(new CylinderGeometry(0, 500, 1500),
            new MeshLambertMaterial({ color: 0x38eeff, opacity: options.o, transparent: (options.o < 1) }));
        icon.rotation.x = MathUtils.degToRad(-90);
        icon.visible = true;
        //app.scene.add(app.boreholeMarker);
        let addIcon = false;

        // if we're not reusing the icon, remove the old one and init new one
        if (icon !== this._icon) {
            if (this._icon) {
                this._removeIcon();
            }
            addIcon = true;

            //if (options.title) {
            //    icon.title = options.title;
            //}
            //if (options.alt) {
            //    icon.alt = options.alt;
            //}
        }
        this._icon = icon;

        //this._initInteraction();

        if (addIcon === true) {
            this.getScene().add(this._icon);
        }
    }

    scaleZ(z) {
        // this._icon.scale.z = z;    
        return;    
    }

    _removeIcon() {
        //if (this.options.riseOnHover) {
        //    this.off({
        //        mouseover: this._bringToFront,
        //        mouseout: this._resetZIndex
        //    });
        //}

        //L.DomUtil.remove(this._icon);
        this.getScene().remove(this._icon);
        //this.removeInteractiveTarget(this._icon);

        this._icon = null;
    }

    _setPos(pos) {
        //L.DomUtil.setPosition(this._icon, pos);
        this._icon.position.set(pos.x, pos.y, pos.z);

    }

    setLatLng(latlng) {
        this._latlng = latlng;
        this.update();
    }

}