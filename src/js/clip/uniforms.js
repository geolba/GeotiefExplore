import { Vector3 } from 'three/src/math/Vector3';
import { Color } from 'three/src/math/Color';

let uniforms = {

    clipping: {
        color: { type: "c", value: new Color(0x3d9ecb) },
        clippingLow: { type: "v3", value: new Vector3(0, 0, 0) },
        clippingHigh: { type: "v3", value: new Vector3(0, 0, 0) }
    },

    caps: {
        color: { type: "c", value: new Color(0xf83610) }
    }

};
export { uniforms };