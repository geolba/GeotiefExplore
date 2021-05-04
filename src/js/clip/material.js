import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { LineBasicMaterial } from 'three/src/materials/LineBasicMaterial';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { uniforms } from "./uniforms";
import { shader } from './shader';
import { DoubleSide, BackSide } from 'three/src/constants';

let capMaterial = new ShaderMaterial({
    uniforms: uniforms.caps,
    vertexShader: shader.vertex,
    fragmentShader: shader.fragment
});

let frontStencilMaterial = new ShaderMaterial({
    uniforms: uniforms.clipping,
    vertexShader: shader.vertexClipping,
    fragmentShader: shader.fragmentClippingFront,
    colorWrite: false,
    depthWrite: false,
});

let backStencilMaterial = new ShaderMaterial({
    uniforms: uniforms.clipping,
    vertexShader: shader.vertexClipping,
    fragmentShader: shader.fragmentClippingFront,
    colorWrite: false,
    depthWrite: false,
    side: BackSide
});

// beige:
// let BoxBackFace = new MeshBasicMaterial({ color: 0xEEDDCC, transparent: true });
let BoxBackFace = new MeshBasicMaterial({ color: 0xf8f8ff, transparent: true, opacity: 0.5 });
// black box grid: mouse grey:
// let BoxWireframe = new LineBasicMaterial({ color: 0x000000, linewidth: 2 });
let BoxWireframe = new LineBasicMaterial({ color: 0x6f6f6f, linewidth: 3 });

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
    backStencilMaterial,
    BoxBackFace,
    BoxWireframe,
    BoxWireActive,
    Invisible
}
