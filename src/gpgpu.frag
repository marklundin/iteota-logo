uniform sampler2D uTex;
uniform sampler2D uOrigin;
uniform vec3 uMouse;

uniform float uTime;
uniform vec2 uResolution;
uniform float uConverge;

#pragma glslify: noise = require(glsl-curl-noise)

void main(){

    vec2 uv = gl_FragCoord.xy / uResolution;

    vec3 origin = texture2D( uTex, uv ).xyz;

    vec3 p = origin;
    p += ( noise( p *  mix( 0.07, 0.01, uConverge ) ) * mix( 0.2, 0.3, uConverge ));



    // Rotational Vector
    vec3 direction = cross( normalize( p ), vec3( 0., 0., 1.0 ));
    float th = 1.0 - uConverge;
    float force = 0.8 * (th*th*th);


    vec3 logo = texture2D( uOrigin, uv ).xyz;
    vec3 d = logo - origin;

    float l = smoothstep( 200.0, 10., length( uMouse - origin ));

    float swipe =  smoothstep( 1000.0, 0.0, logo.x );
    vec3 attractor = normalize( d ) * clamp( length( d ) * 0.1 , 0.2, 7. ) * ( 1.0 - l );
    attractor += noise( origin * 0.2 ) *  0.8;
    attractor += noise( vec3( origin.xy, origin.z + (uTime * 0.00000002 )) * 0.07 ) * ( l * 20.0);

    direction = mix( direction * force, attractor, uConverge * swipe );


    p += direction;

    // p = logo;

    // vec3 mouseTheta = ( p - uMouse  );
    // mouseTheta += noise( mouseTheta * 0.002 ) * 2.9;
    // float mouseForce = clamp( 0., 1., smoothstep( 10.0, 20., length( mouseTheta ))) * 100.0;
    //
    // p += normalize( mouseTheta ) * mouseForce;

    gl_FragColor = vec4( p, 1.0 );

}
