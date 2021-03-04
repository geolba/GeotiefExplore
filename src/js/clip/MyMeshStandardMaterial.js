import { MeshStandardMaterial } from 'three/src/materials/MeshStandardMaterial';
import { shader } from './shader';

export class MyMeshStandardMaterial extends MeshStandardMaterial {
  constructor(materialParameters, uniforms) {
   
    super(materialParameters);
    this.uniforms = uniforms;

    this.onBeforeCompile = m_shader => {  

      m_shader.uniforms.clippingLow = this.uniforms.clippingLow; // { type: "v3", value: new Vector3(0, 0, 0) };
      m_shader.uniforms.clippingHigh = this.uniforms.clippingHigh; // { type: "v3", value: new Vector3(0, 0, 0) };



  //     m_shader.vertexShader = `
  //     varying vec3 vPos;
  //     varying vec4 worldPosition;
  //   ${m_shader.vertexShader}
  // `.replace(
  //       `#include <fog_vertex>`,
  //       `#include <fog_vertex>
  //       worldPosition = modelMatrix * vec4( position, 1.0 );
  //       `
  //     );

      m_shader.vertexShader = shader.vertexMeshStandard;

      // m_shader.vertexShader = 'varying vec4 realPosition; ' + m_shader.vertexShader;
      // m_shader.vertexShader = m_shader.vertexShader.replace(
      //   `#include <fog_vertex>`,
      //   `#include <fog_vertex>
      //    realPosition = modelMatrix * vec4( position, 1.0 );`
      // );

      m_shader.fragmentShader = shader.fragmentClippingMeshStandard;

      //prepend the input to the shader
      // m_shader.fragmentShader = `
      //   uniform vec3 clippingLow;
      //   uniform vec3 clippingHigh;
      //   varying vec4 worldPosition;
      //   ${m_shader.fragmentShader}
      //   `.replace(
      //   `gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,
      //   `
      //     if (
      //       worldPosition.x < clippingLow.x
      //      || worldPosition.x > clippingHigh.x
      //      || worldPosition.y < clippingLow.y
      //      || worldPosition.y > clippingHigh.y
      //      || worldPosition.z < clippingLow.z
      //      || worldPosition.z > clippingHigh.z
      //    ) {    
      //     discard;
      //   } else {       
      //     gl_FragColor = vec4( outgoingLight, diffuseColor.a );
      //   }
      //   `
      // );

    };

  }
}