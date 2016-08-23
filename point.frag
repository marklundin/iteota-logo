


float aastep(float threshold, float value) {
    #ifdef GL_OES_standard_derivatives
        float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;
        return smoothstep(threshold-afwidth, threshold+afwidth, value);
    #else
        return step(threshold, value);
    #endif
}


uniform float uOpacity;


void main() {

    vec2 uv = gl_PointCoord.xy - vec2( 0.5 );
    float value = aastep( 0.5, 1.0 - length( uv ));
    // if( value == 0.0 ) discard;
    gl_FragColor = vec4( vec3( 1.0 ), value * uOpacity );
}
