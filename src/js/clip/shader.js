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
		
		void main() {
			vec4 vPos = modelViewMatrix * vec4( position, 1.0 );
			vPosition = vPos.xyz;

			vNormal = normalMatrix * normal;
			pixelNormal = normal;
			// worldPosition = modelMatrix * vec4( position, 1.0 );
			camPosition = cameraPosition;
			
			gl_Position = projectionMatrix * vPos;
			// gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			
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

	fragmentClippingFront: '\
		uniform vec3 color;\
		uniform vec3 clippingLow;\
		uniform vec3 clippingHigh;\
		\
		varying vec3 pixelNormal;\
		varying vec4 worldPosition;\
		varying vec3 camPosition;\
		\
		void main( void ) {\
			\
			float shade = (\
				  3.0 * pow ( abs ( pixelNormal.y ), 2.0 )\
				+ 2.0 * pow ( abs ( pixelNormal.z ), 2.0 )\
				+ 1.0 * pow ( abs ( pixelNormal.x ), 2.0 )\
			) / 3.0;\
			\
			if (\
				   worldPosition.x < clippingLow.x  && camPosition.x < clippingLow.x\
				|| worldPosition.x > clippingHigh.x && camPosition.x > clippingHigh.x\
				|| worldPosition.y < clippingLow.y  && camPosition.y < clippingLow.y\
				|| worldPosition.y > clippingHigh.y && camPosition.y > clippingHigh.y\
				|| worldPosition.z < clippingLow.z  && camPosition.z < clippingLow.z\
				|| worldPosition.z > clippingHigh.z && camPosition.z > clippingHigh.z\
			) {\
				\
				discard;\
				\
			} else {\
				\
				gl_FragColor = vec4( color * shade, 1.0 );\
				\
			}\
			\
		}',


	invisibleVertexShader: '\
		void main() {\
			vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\
			gl_Position = projectionMatrix * mvPosition;\
		}',

	invisibleFragmentShader: '\
		void main( void ) {\
			gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );\
			discard;\
		}'

}
export { shader };