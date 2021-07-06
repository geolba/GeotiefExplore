import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { MeshStandardMaterial } from 'three/src/materials/MeshStandardMaterial';
import { LineBasicMaterial } from 'three/src/materials/LineBasicMaterial';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { uniforms } from "./uniforms";
import { shader } from './shader';
import { DoubleSide, BackSide, FrontSide, EqualStencilFunc, KeepStencilOp, DecrementStencilOp, IncrementStencilOp, InvertStencilOp } from 'three/src/constants';
import { DecrementWrapStencilOp, IncrementWrapStencilOp } from 'three/src/constants';
import { NotEqualStencilFunc, ReplaceStencilOp, AlwaysStencilFunc } from 'three/src/constants';
import { Vector3 } from 'three/src/math/Vector3';
import { Plane } from 'three/src/math/Plane';

// let profileMaterial = new ShaderMaterial({
//     // metalness: 0.1,
//     // roughness: 0.75,
//     // flatShading: true,
//     stencilWrite: true,
//     // stencilRef: 0,
//     stencilFunc: NotEqualStencilFunc,
//     stencilFail: ReplaceStencilOp,
//     stencilZFail: ReplaceStencilOp,
//     stencilZPass: ReplaceStencilOp,
//     uniforms: uniforms.caps,
//     vertexShader: shader.vertex,
//     fragmentShader: shader.fragment
// });
// y normal will not clip models on northern hemisphere
// but why not -1 ??
function dummyPlane()   {
    const normal = new Vector3( 0, 1, 0 );
    return new Plane( normal, 0 );
}

let featureMat = new MeshStandardMaterial({
    color: 0xC1FF07,
    metalness: 0.1,
    roughness: 0.75,
    flatShading: true,
    side: DoubleSide,
    // clippingPlanes: [ dummyPlane() ]
});


let profileMaterial = new MeshStandardMaterial( {
    color: 0xE91E63,
    metalness: 0.1,
    roughness: 0.75,
    flatShading: true,
    stencilWrite: true,     
    // stencilRef: 0,
    stencilFunc: NotEqualStencilFunc,
    stencilFail: ReplaceStencilOp,
    stencilZFail: ReplaceStencilOp,
    stencilZPass: ReplaceStencilOp,
    // stencilFunc: NotEqualStencilFunc,
    // stencilFail: ReplaceStencilOp,
    // stencilZFail: ReplaceStencilOp,
    // stencilZPass: ReplaceStencilOp
} );

let frontStencilMaterial = new ShaderMaterial({
    depthWrite: false,
    depthTest: false,
    colorWrite: false,
    stencilWrite: true,
    stencilFunc: AlwaysStencilFunc,
    uniforms: uniforms.clipping,
    vertexShader: shader.vertexClipping,
    fragmentShader: shader.fragmentClippingFront, 
    // clippingPlanes: [dummyPlane()],
    side: FrontSide,
    // stencilFail: DecrementWrapStencilOp,
    // stencilZFail: DecrementWrapStencilOp,
    // stencilZPass: DecrementWrapStencilOp
    stencilFail: DecrementWrapStencilOp,
    stencilZFail: DecrementWrapStencilOp,
    stencilZPass: DecrementWrapStencilOp
});

let backStencilMaterial = new ShaderMaterial({
    depthWrite: false,
    depthTest: false,
    colorWrite: false,
    stencilWrite: true,
    stencilFunc: AlwaysStencilFunc,
    uniforms: uniforms.clipping,
    vertexShader: shader.vertexClipping,
    fragmentShader: shader.fragmentClippingFront,   
    // clippingPlanes: [ dummyPlane() ],
    side: BackSide,
    // stencilFail: IncrementWrapStencilOp,
    // stencilZFail: IncrementWrapStencilOp,
    // stencilZPass: IncrementWrapStencilOp
    stencilFail: IncrementWrapStencilOp,
    stencilZFail: IncrementWrapStencilOp,
    stencilZPass: IncrementWrapStencilOp
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

function toBack(mat) {    
    const material = mat.clone();
    material.side = BackSide,
    material.stencilFail = IncrementWrapStencilOp;
    material.stencilZFail = IncrementWrapStencilOp;
    material.stencilZPass = IncrementWrapStencilOp;
    return material;
};


function toFront(mat) {    
    const material = mat.clone();
    material.side = FrontSide;
    material.stencilFail = DecrementWrapStencilOp;
    material.stencilZFail = DecrementWrapStencilOp;
    material.stencilZPass = DecrementWrapStencilOp;
    return material;
};


export {
    toBack,
    toFront,
    featureMat,
    profileMaterial,
    frontStencilMaterial,
    backStencilMaterial,
    BoxBackFace,
    BoxWireframe,
    BoxWireActive,
    Invisible
}
