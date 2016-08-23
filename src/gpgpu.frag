uniform sampler2D uTex;
uniform sampler2D uOrigin;

uniform float uTime;
uniform vec2 uResolution;
uniform float uConverge;

#pragma glslify: noise = require(glsl-curl-noise)

void main(){

    vec2 uv = gl_FragCoord.xy / uResolution;
    vec2 uStep = vec2( 1.0 ) / uResolution;

    vec3 origin = texture2D( uTex, uv ).xyz;

    vec3 p = origin;
    p += ( noise( p *  mix( 0.07, 0.01, uConverge ) ) * mix( 0.2, 0.3, uConverge ));



    // Rotational Vector
    vec3 direction = cross( normalize( p ), vec3( 0., 0., 1.0 ));
    float th = 1.0 - uConverge;
    float force = 0.8 * (th*th*th);


    vec3 logo = texture2D( uOrigin, uv ).xyz;
    vec3 d = logo - origin;

    float swipe =  smoothstep( 1000.0, 0.0, logo.x );
    vec3 attractor = normalize( d ) * clamp( length( d ) * 0.1 , 0.2, 7. );
    attractor += noise( origin * 0.2 ) * 0.9;

    direction = mix( direction * force, attractor, uConverge * swipe );

    p += direction;


    vec3 position = p;//mix( p, attractor, uConverge * smoothstep( -1000., 1000., logo.x ));


    gl_FragColor = vec4( position, 1.0 );

}
