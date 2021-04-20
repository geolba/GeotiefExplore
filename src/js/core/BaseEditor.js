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
        dxfIdentifyParams.clientX = eventX; //351
        dxfIdentifyParams.clientY = eventY; //554;
        dxfIdentifyParams.width = this.map.container.clientWidth; //712;
        dxfIdentifyParams.height = this.map.container.clientHeight; //715; 
        let deferred = this.mapTool.drillTask.execute(dxfIdentifyParams);
        deferred.then(this.handleQueryResults.bind(this));

        this._processDrawingClick(e);
    }

    handleQueryResults() {
        let results = arguments;
        let features = results[0].features;
        let aufschlag = results[0].aufschlag;
        // features.sort(function (point1, point2) {
        //     // Sort by votes
        //     // If the first item has a hwigher number, move it up
        //     // If the first item has a lower number, move it down
        //     if (point1.distance > point2.distance) return -1;
        //     if (point1.distance < point2.distance) return 1;
            
        // });
        // features.sort(function (point1, point2) {
        //     // Sort by votes
        //     // If the first item has a higher number, move it up
        //     // If the first item has a lower number, move it down
        //     if (point1.layerId > point2.layerId) return 1;
        //     if (point1.layerId < point2.layerId) return -1;
            
        // });
        // let newFeatures = [];
        let featuresCopy = Array.from(features);
        for (let i = 0; i < features.length; i ++) {
            let p1 = features[i];
            let p2;
            if (features[i+2] != null){
            if (util.round(features[i+1].distance, 4) == util.round(features[i+2].distance, 4)){
               if (features[i+2].layerId == p1.layerId) {
                    p2 = features[i+2]; 
                    util.swap(features, i + 1, i +2);              

                } 
            }
        }
            // newFeatures.push(p1, p2);
        }        
        
        // set the borhole marker
        if (!this.isConnected()) {
            this.connect(aufschlag);
        }
        else {
            this.marker.setLatLng(aufschlag);
        }

        // calculate heights vor bar chart
        let data = [];
        for (let j = features.length - 2; j >= 0; j--) {
            let feature = features[j];
            let point = feature.point;
            // // clicked coordinates: skalierung wieder wegrechnen:
            // let pt = this.map.dataservice.toMapCoordinates(point.x, point.y, point.z);

            let layerId = feature.layerId;
            //var layer = this.map.dataservice.layers[layerId];
            let layer = this.map._layers[layerId];
            let nextPoint;
            if (j !== features.length - 1) {
                let previousFeature = features[j + 1];
                // if (feature.distance == previousFeature.distance) {
                //     continue;
                // }
                let previousPoint = { x: features[j + 1].point.x, y: features[j + 1].point.y, z: features[j + 1].point.z };
                // let previousPt = this.map.dataservice.toMapCoordinates(previousPoint.x, previousPoint.y, previousPoint.z);

                //var barHeight = point.z - previousPoint.z;

                let realHeight = point.z - previousPoint.z;
                //var dist = parseInt((300 / 6000) * realHeight);

                if (Math.round(realHeight) > 0) {
                data.push({
                    dist: realHeight,//dist,
                    max: point.z,
                    min: previousPoint.z,
                    color: layer.color,
                    name: layer.name
                });
                //app.barChart.addBar(dist, layer.materialParameter[0].color, layer.name);
                }
            }
        }

        this.marker.setPopupChartData(data);
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