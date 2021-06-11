// https://github.com/LeLeXD/Metalness/blob/master/Shader/index.html

let shader = {

	// A vertex shader is a function that is applied on every vertex (point) of a mesh. 
	// It is usually used to distort or animate the shape of a mesh. Within our script it looks something like this:
	vertex: `
		uniform vec3 color;
		varying vec3 pixelNormal;
		
		void main() {
			
			pixelNormal = normal;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			
		}`,

	vertexClipping: `
		uniform vec3 color;
		uniform vec3 clippingLow;
		uniform vec3 clippingHigh;
		
		varying vec3 pixelNormal;
		varying vec4 worldPosition;
		varying vec3 camPosition;
		varying vec3 vNormal;
		varying vec3 vPosition;
		varying vec2 vUv;
		
		void main() {
			vUv = uv;
			vec4 vPos = modelViewMatrix * vec4( position, 1.0 );
			vPosition = vPos.xyz;

			vNormal = normalMatrix * normal;
			pixelNormal = normal;
			worldPosition = modelMatrix * vec4( position, 1.0 );
			camPosition = cameraPosition;
			
			// gl_Position = projectionMatrix * vPos;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			
		}`,

	fragment: `
		uniform vec3 color;
		varying vec3 pixelNormal;

		varying vec3 vNormal;
		varying vec3 vPosition;

		// uniform vec3 spotLightPosition; // in world space		
		// uniform vec3 clight;
		// uniform vec3 cspec;
		// uniform float roughness;
		const float PI = 3.14159;
		
		
		void main( void ) {
			
			float shade = (
				  3.0 * pow ( abs ( pixelNormal.y ), 2.0 )
				+ 2.0 * pow ( abs ( pixelNormal.z ), 2.0 )
				+ 1.0 * pow ( abs ( pixelNormal.x ), 2.0 )
			) / 3.0;

			gl_FragColor = vec4( color * shade, 1.0 );
			//gl_FragColor = vec4(color, 1.0);
			
			// vec4 lPosition = viewMatrix * vec4( spotLightPosition, 1.0 );
			// vec3 l = normalize(lPosition.xyz - vPosition.xyz);			
			// vec3 n = normalize( vNormal );  // interpolation destroys normalization, so we have to normalize
			// vec3 v = normalize( -vPosition);
			// vec3 h = normalize( v + l);
					
			// // small quantity to prevent divisions by 0
			// float nDotl = max(dot( n, l ),0.000001);
			// float lDoth = max(dot( l, h ),0.000001);			
			// float nDoth = max(dot( n, h ),0.000001);			
			// float vDoth = max(dot( v, h ),0.000001);			
			// float nDotv = max(dot( n, v ),0.000001);
			
			// vec3 specularBRDF = FSchlick(lDoth)*GSmith(nDotv,nDotl)*DGGX(nDoth,roughness*roughness)/(4.0*nDotl*nDotv);	
			// vec3 outRadiance = (PI* clight * nDotl * specularBRDF);			
			
			// gl_FragColor = vec4(pow( outRadiance, vec3(1.0/2.2)), 1.0);		
			
		}`,

	fragmentClippingFront: `
		uniform sampler2D map;
		uniform vec3 color;
		uniform vec3 clippingLow;
		uniform vec3 clippingHigh;
		uniform float clippingScale;
		uniform float percent;
		
		varying vec3 pixelNormal;
		varying vec4 worldPosition;
		varying vec3 camPosition;
		varying vec2 vUv;
		
		void main( void ) {
			
			float shade = (
				  3.0 * pow ( abs ( pixelNormal.y ), 2.0 )
				+ 2.0 * pow ( abs ( pixelNormal.z ), 2.0 )
				+ 1.0 * pow ( abs ( pixelNormal.x ), 2.0 )
			) / 3.0;
			
			// if (
			// 	   worldPosition.x < clippingLow.x  && camPosition.x < clippingLow.x
			// 	|| worldPosition.x > clippingHigh.x && camPosition.x > clippingHigh.x
			// 	|| worldPosition.y < clippingLow.y  && camPosition.y < clippingLow.y
			// 	|| worldPosition.y > clippingHigh.y && camPosition.y > clippingHigh.y
			// 	|| worldPosition.z < clippingLow.z  && camPosition.z < clippingLow.z
			// 	|| worldPosition.z > clippingHigh.z && camPosition.z > clippingHigh.z
			// ) {
				if (
					worldPosition.x < clippingLow.x  
				 || worldPosition.x > clippingHigh.x 
				 || worldPosition.y < clippingLow.y  
				 || worldPosition.y > clippingHigh.y
				 || worldPosition.z < (clippingLow.z * clippingScale)
				 || worldPosition.z >  (clippingHigh.z * clippingScale)
			 ) {
				
				discard;
				
			} else {
				
				//gl_FragColor = vec4( color * shade, 1.0 );
				gl_FragColor = texture2D(map, vUv);
				gl_FragColor.a = percent;
				
			}
			
		}`,

	vertexMeshStandard: `
		#define STANDARD
		uniform float scale;
		varying vec3 vViewPosition;		
		varying vec4 worldPosition;
		
				
		#include <common>
		#include <uv_pars_vertex>
		#include <uv2_pars_vertex>
		#include <displacementmap_pars_vertex>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <morphtarget_pars_vertex>
		#include <skinning_pars_vertex>
		#include <shadowmap_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>
		
		void main() {
		
			#include <uv_vertex>
			#include <uv2_vertex>
			#include <color_vertex>
		
			#include <beginnormal_vertex>
			#include <morphnormal_vertex>
			#include <skinbase_vertex>
			#include <skinnormal_vertex>
			#include <defaultnormal_vertex>
		
		
		
			#include <begin_vertex>
			#include <morphtarget_vertex>
			#include <skinning_vertex>
			#include <displacementmap_vertex>
			#include <project_vertex>
			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
		
			vViewPosition = - mvPosition.xyz;
			// position.z = position.z * scale;
			
			worldPosition = modelMatrix * vec4( position, 1.0 );
					
			#include <worldpos_vertex>
			#include <shadowmap_vertex>
			#include <fog_vertex>
		}`,

	fragmentClippingMeshStandard: `
		// #ifdef GL_ES
		// precision highp float;
		// #endif

		#define STANDARD

		uniform vec3 diffuse;
		uniform vec3 emissive;
		uniform float roughness;
		uniform float metalness;
		uniform float opacity;
		
		
		varying vec3 vViewPosition;
		uniform vec3 clippingLow;
        uniform vec3 clippingHigh;		
		uniform float clippingScale;
        varying vec4 worldPosition;
				
		#include <common>
		#include <packing>
		#include <dithering_pars_fragment>
		#include <color_pars_fragment>
		#include <uv_pars_fragment>
		#include <uv2_pars_fragment>
		#include <map_pars_fragment>
		#include <alphamap_pars_fragment>
		#include <aomap_pars_fragment>
		#include <lightmap_pars_fragment>
		#include <emissivemap_pars_fragment>
		// #include <transmissionmap_pars_fragment>
		#include <bsdfs>
		#include <transmission_pars_fragment>
		#include <cube_uv_reflection_fragment>
		#include <envmap_common_pars_fragment>
		#include <envmap_physical_pars_fragment>
		#include <fog_pars_fragment>
		#include <lights_pars_begin>
		#include <lights_physical_pars_fragment>
		#include <shadowmap_pars_fragment>
		#include <bumpmap_pars_fragment>
		#include <normalmap_pars_fragment>
		#include <clearcoat_pars_fragment>
		#include <roughnessmap_pars_fragment>
		#include <metalnessmap_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>
		
		void main() {
		
			#include <clipping_planes_fragment>
		
			vec4 diffuseColor = vec4( diffuse, opacity );
			ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
			vec3 totalEmissiveRadiance = emissive;
		
			#ifdef TRANSMISSION
				float totalTransmission = transmission;
				float thicknessFactor = thickness;
			#endif
		
			#include <logdepthbuf_fragment>
			#include <map_fragment>
			#include <color_fragment>
			#include <alphamap_fragment>
			#include <alphatest_fragment>
			#include <roughnessmap_fragment>
			#include <metalnessmap_fragment>
			#include <normal_fragment_begin>
			#include <normal_fragment_maps>
			#include <clearcoat_normal_fragment_begin>
			#include <clearcoat_normal_fragment_maps>
			#include <emissivemap_fragment>
			//#include <transmissionmap_fragment>

			vec3 rawDiffuseColor = diffuseColor.rgb;
			#include <transmission_fragment>
					
			// accumulation
			#include <lights_physical_fragment>
			#include <lights_fragment_begin>
			#include <lights_fragment_maps>
			#include <lights_fragment_end>
		
			// modulation
			#include <aomap_fragment>
		
			vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;

			if (
				worldPosition.x < clippingLow.x  
			 || worldPosition.x > clippingHigh.x 
			 || worldPosition.y < clippingLow.y  
			 || worldPosition.y > clippingHigh.y
			 || (worldPosition.z) < (clippingLow.z * clippingScale)
			 || (worldPosition.z) > (clippingHigh.z * clippingScale)
		 ) {			
			discard;			
		} else {			
			gl_FragColor = vec4( outgoingLight, diffuseColor.a );			
		}	
		}`,


	invisibleVertexShader: `
		void main() {
			vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
			gl_Position = projectionMatrix * mvPosition;
		}`,

	invisibleFragmentShader: `
		void main( void ) {
			gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
			discard;
		}`

}
export { shader };