uniform sampler2D uTex;
uniform sampler2D uOrigin;
uniform vec3 uMouse;
uniform vec3 uMouseVel;

uniform float uTime;
uniform vec2 uResolution;
uniform float uConverge;

#pragma glslify: noise = require(glsl-curl-noise)
#pragma glslify: snoise2= require(glsl-noise/simplex/2d)

void main(){

    vec2 uv = gl_FragCoord.xy / uResolution;

    vec3 origin = texture2D( uTex, uv ).xyz;



    vec3 p = origin;
    float theta = atan( p.x, p.y ) * .02;
    p += normalize( p ) * 0.1 * ( 1.0 - uConverge );

    if( length( p ) * ( 1.0 - uConverge ) > 280. + ( 50. * snoise2( vec2( theta * 600., 280. ) )) ){
      p = normalize( p ) * 200.;
    }

    float irisNoise = ( snoise2( vec2( theta* 100., length( p ) * 0.001 ) * 0.02 ) * mix( .1, 0.3, uConverge ));
    vec3 perp = cross( normalize( p ), vec3( 0., 0., 1.)) * sin( irisNoise );

    p += mix( perp, noise( p * 0.01 ) * 0.3, uConverge );
    // p +=



    // Rotational Vector
    vec3 direction = vec3(0.0);//cross( normalize( p ), vec3( 0., 0., 1.0 ));
    // float th = 1.0 - uConverge;
    // float force = 0.8 * (th*th*th);


    vec3 logo = texture2D( uOrigin, uv ).xyz;
    vec3 d = logo - origin;

    float l = smoothstep( 250.0, 100., length( uMouse - origin )) * ( smoothstep( 5.0, 20.0, length ( uMouseVel  )) + 0.5 );

    float swipe =  smoothstep( 1000.0, 0.0, logo.x );
    vec3 attractor = normalize( d ) * clamp( length( d ) * 0.1 , 0.2, 7. );

    attractor = mix( attractor, ( noise( origin * 0.01 ) * 0.4 ), l );
    attractor += noise( origin * 0.2 ) *  0.8;
    attractor += noise( vec3( p.xy, p.z + uTime) * 0.007 ) * ( l * 20.0);

    direction = mix( direction, attractor, uConverge * swipe );


    p += direction;



    // p = logo;

    // vec3 mouseTheta = ( p - uMouse  );
    // mouseTheta += noise( mouseTheta * 0.002 ) * 2.9;
    // float mouseForce = clamp( 0., 1., smoothstep( 10.0, 20., length( mouseTheta ))) * 100.0;
    //
    // p += normalize( mouseTheta ) * mouseForce;

    gl_FragColor = vec4( p, 1.0 );

}
