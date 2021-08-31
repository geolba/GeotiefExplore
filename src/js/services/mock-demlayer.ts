import { DemLayer } from '../layer/DemLayer';
export const DEM_LAYER: DemLayer = new DemLayer(
    
        true, 'dem', 'DEM Layer', 1, true, 16382457,//"baseExtent": this.baseExtent,
        [{
            width: 405,
            // "url": "https://sdi.noe.gv.at/at.gv.noe.geoserver/OGD/wms",
            url: " https://ows.terrestris.de/osm/service",
            height: 549,
            bboxSR: 3857,
            type: "wms"
        },
        {
            width: 405,
            // "url": "https://sdi.noe.gv.at/at.gv.noe.geoserver/OGD/wms",
            url: "https://ows.terrestris.de/osm-gray/service",
            height: 549,
            bboxSR: 3857,
            type: "wms",
            texture: undefined
        }],
        //"baseExtent": this.baseExtent,
        {
            min: { x: 0, y: 0 },
            max: { x: 0, y: 0 }
        },
         [{
            i: 0,
            materialtypee: 0,
            ds: 1,
            bottomZ: 3000,
            o: 0.7
        }],
    
);





