import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { MeshStandardMaterial } from 'three/src/materials/MeshStandardMaterial';
import { LineBasicMaterial } from 'three/src/materials/LineBasicMaterial';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { uniforms } from "./uniforms";
import { shader } from './shader';
import { DoubleSide, BackSide, FrontSide, EqualStencilFunc, KeepStencilOp, DecrementStencilOp, IncrementStencilOp, InvertStencilOp, GreaterStencilFunc, NeverStencilFunc, LessStencilFunc, LessEqualStencilFunc } from 'three/src/constants';
import { DecrementWrapStencilOp, IncrementWrapStencilOp } from 'three/src/constants';
import { NotEqualStencilFunc, ReplaceStencilOp, AlwaysStencilFunc } from 'three/src/constants';

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
let profileMaterial = new MeshStandardMaterial( {
    color: 0xE91E63,
    metalness: 0.1,
    roughness: 0.75,
    flatShading: true,
    stencilWrite: true,
    stencilRef: 0,
    stencilFunc: NotEqualStencilFunc,
    stencilFail: ReplaceStencilOp,
    stencilZFail: ReplaceStencilOp,
    stencilZPass: ReplaceStencilOp
    // stencilFunc: NotEqualStencilFunc,
    // stencilFail: ReplaceStencilOp,
    // stencilZFail: ReplaceStencilOp,
    // stencilZPass: ReplaceStencilOp
} );

let stencilMaterial = new ShaderMaterial({
    depthWrite: false,
    depthTest: false,
    colorWrite: false,
    stencilWrite: true,
    stencilFunc: AlwaysStencilFunc,
    // uniforms: uniforms.clipping,
    vertexShader: shader.vertexClipping,
    fragmentShader: shader.fragmentClippingFront, 
});

let frontStencilMaterial = new ShaderMaterial({
    depthWrite: false,
    depthTest: false,
    colorWrite: false,
    stencilWrite: true,
    stencilFunc: AlwaysStencilFunc,
    uniforms: uniforms.clipping,
    vertexShader: shader.vertexClipping,
    fragmentShader: shader.fragmentClippingFront, 
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

// export const profileMat = new MeshStandardMaterial( {

//     color: 0xE91E63,
//     metalness: 0.1,
//     roughness: 0.75,
//     flatShading: true,
//     stencilWrite: true,
//     // stencilRef: 0,
//     stencilFunc: NotEqualStencilFunc,
//     stencilFail: ReplaceStencilOp,
//     stencilZFail: ReplaceStencilOp,
//     stencilZPass: ReplaceStencilOp
// } );


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
    stencilMaterial,
    profileMaterial,
    frontStencilMaterial,
    backStencilMaterial,
    BoxBackFace,
    BoxWireframe,
    BoxWireActive,
    Invisible
}
