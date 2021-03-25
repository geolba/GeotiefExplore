import * as util from './utilities';

var Editable = {

    makeCancellable: function (e) {
        e.cancel = function () {
            e._cancelled = true;
        };
    }
};

export class BaseEditor {

    map;
    marker;
    mapTool;


    constructor(map, featureLayer, options = {}) {
        util.setOptions(this, options);
        this.map = map;
        this.marker = featureLayer;
        this.marker.editor = this;
        //this.editLayer = new LayerGroup();
        this.mapTool = map.mapTool; //this.options.editTools || map.mapTool;

        this.marker.bindPopup(map._controls.boreholePopup);
    }

    enable() {
        if (this._enabled) return this;
        //if (this.isConnected() == true) {
        //    this.mapTool.editLayer.addLayer(this.editLayer);
        //}
        this.onEnable();
        this._enabled = true;
        this.marker.on('remove', this.disable.bind(this));
        return this;
    }

    disable() {
        this.marker.off('remove', this.disable.bind(this));
        //this.editLayer.clearLayers();
        //this.mapTool.editLayer.removeLayer(this.editLayer);
        this.onDisable();
        delete this._enabled;
        if (this._drawing) this.cancelDrawing();
        return this;
    }

    isConnected() {
        return this.map.hasLayer(this.marker);
    }

    drawing() {
        return !!this._drawing;
    }

    fireAndForward(type, e) {
        e = e || {};
        e.layer = this.marker;
        this.marker.emit(type, e);
        this.mapTool.fireAndForward(type, e);
    }

    onEnable() {
        this.fireAndForward('editable:enable');
    }

    onDisable() {
        this.fireAndForward('editable:disable');
    }

    onEditing() {
        this.fireAndForward('editable:editing');
    }


    onDrawingMouseDown(e) {
        this.fireAndForward('editable:drawing:mousedown', e);
    }


    startDrawing() {
        if (!this._drawing) {
            this._drawing = 1;// L.Editable.FORWARD;
        }
        this.mapTool.registerForDrawing(this);
        this._onStartDrawing();
    }

    _onStartDrawing() {
        this.fireAndForward('editable:drawing:start');
    }


    onDrawingClick(e) {
        if (!this.drawing) return;
        Editable.makeCancellable(e);
        this.fireAndForward('editable:drawing:click', e);
        if (e._cancelled) return;
        //if (!this.isConnected()) {
        //    this.connect(e);
        //}        
        let eventX = (e.clientX !== undefined) ? e.clientX : (e.touches && e.touches[0].clientX);
        let eventY = (e.clientY !== undefined) ? e.clientY : (e.touches && e.touches[0].clientY);
        let dxfIdentifyParams = {};
        dxfIdentifyParams.clientX = eventX;
        dxfIdentifyParams.clientY = eventY;
        dxfIdentifyParams.width = this.map.container.clientWidth;
        dxfIdentifyParams.height = this.map.container.clientHeight;
        let deferred = this.mapTool.drillTask.execute(dxfIdentifyParams);
        deferred.then(this.handleQueryResults.bind(this));

        this._processDrawingClick(e);
    }

    handleQueryResults() {
        let results = arguments;
        //var content = [];
        let features = results[0].features;
        let aufschlag = results[0].aufschlag;
        if (!this.isConnected()) {
            this.connect(aufschlag);
        }
        else {
            this.marker.setLatLng(aufschlag);
        }
        this.marker.setPopupChartData("test");
        this.marker.openPopup();

    }

    connect(e) {
        // On touch, the latlng has not been updated because there is
        // no mousemove.
        if (e) this.marker._latlng = { x: e.x, y: e.y, z: e.z }; //e.latlng;
        //this.marker.update();

        //L.Editable.BaseEditor.prototype.connect.call(this, e);
        this.mapTool.connectCreatedToMap(this.marker);
        //this.mapTool.editLayer.addLayer(this.editLayer);
    }


    _processDrawingClick(e) {
        this.fireAndForward('editable:drawing:clicked', e);
        this._commitDrawing(e);
    }

    _commitDrawing(e) {
        this._onCommitDrawing(e);
    }

    _onCommitDrawing(e) {
        this.fireAndForward('editable:drawing:commit', e);
    }




    cancelDrawing() {
        this._onCancelDrawing();
        this._endDrawing();
    }

    _onCancelDrawing() {
        this.fireAndForward('editable:drawing:cancel');
    }

    _endDrawing() {
        this._drawing = false;
        this.mapTool.unregisterForDrawing(this);
        this._onEndDrawing();
    }

    _onEndDrawing() {
        this.fireAndForward('editable:drawing:end');
    }
}