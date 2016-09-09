uniform sampler2D uPosition;
uniform sampler2D uVelocity;
uniform vec3 uMouse;
uniform vec2 uResolution;

uniform float uTime;


#pragma glslify: noisesdfsd = require(glsl-curl-noise)

void main(){

    vec2 uv = gl_FragCoord.xy / uResolution;

    vec3 p = texture2D( uPosition, uv ).xyz;
    vec3 v = texture2D( uVelocity, uv ).xyz;

    gl_FragColor = vec4( p + v , 1.0 );

}
