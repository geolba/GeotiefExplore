import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { LineBasicMaterial } from 'three/src/materials/LineBasicMaterial';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { uniforms } from "./uniforms";
import { shader } from './shader';
import { DoubleSide } from 'three/src/constants';

let capMaterial = new ShaderMaterial({
    uniforms: uniforms.caps,
    vertexShader: shader.vertex,
    fragmentShader: shader.fragment
});

let frontStencilMaterial = new ShaderMaterial( {
    uniforms:      uniforms.clipping,
    vertexShader:   shader.vertexClipping,
    fragmentShader: shader.fragmentClippingFront,
    // colorWrite: false,
    // depthWrite: false,
} );

let BoxBackFace = new MeshBasicMaterial({ color: 0xEEDDCC, transparent: true });
let BoxWireframe = new LineBasicMaterial({ color: 0x000000, linewidth: 2 });
// yellow select color
let BoxWireActive = new LineBasicMaterial({ color: 0xffff00, linewidth: 4, side: DoubleSide });

let Invisible = new ShaderMaterial({
    vertexShader: shader.invisibleVertexShader,
    fragmentShader: shader.invisibleFragmentShader,
    side: DoubleSide
});

export {
    capMaterial,
    frontStencilMaterial,
    BoxBackFace,
    BoxWireframe,
    BoxWireActive,
    Invisible
}
