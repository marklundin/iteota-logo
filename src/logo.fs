#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif


uniform vec2 uRes;
uniform sampler2D map;
uniform float uTime;

varying vec2 vUv;

#pragma glslify: noise = require('glsl-noise/simplex/3d')


#pragma glslify: aastep = require('glsl-aastep')

void main(){

    float value = 0.0;
    vec2 s = vUv;
    s.y += uTime;
    value += noise( vec3( s * 5.0, uTime )) * 0.01;
    value += noise( vec3( s * 20.0, uTime )) * 0.001;
    // value += noise( vec3( vUv * 30.0, uTime )) * 0.001;
    // value = mix( 0., value, smoothstep( 510., 520., vUv.y ));
    float h = smoothstep( 0.43, .49, vUv.y );


    vec2 sample = vUv;
    sample += value * h;


    float c = texture2D( map, sample ).r;



    gl_FragColor = vec4( vec3( c ), 1.0 );

}
