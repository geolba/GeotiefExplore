

let shader = {

	vertex: '\
		uniform vec3 color;\
		varying vec3 pixelNormal;\
		\
		void main() {\
			\
			pixelNormal = normal;\
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\
			\
		}',

	fragment: '\
		uniform vec3 color;\
		varying vec3 pixelNormal;\
		\
		void main( void ) {\
			\
			float shade = (\
				  3.0 * pow ( abs ( pixelNormal.y ), 2.0 )\
				+ 2.0 * pow ( abs ( pixelNormal.z ), 2.0 )\
				+ 1.0 * pow ( abs ( pixelNormal.x ), 2.0 )\
			) / 3.0;\
			\
			gl_FragColor = vec4( color * shade, 1.0 );\
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