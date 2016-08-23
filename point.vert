attribute vec3 altPosition;
attribute vec2 uvs;
uniform sampler2D uTex;

void main() {

    vec3 finalPosition = texture2D( uTex, uvs ).xyz;

    // Project
    vec4 mvPosition = modelViewMatrix * vec4( finalPosition, 1.0 );

    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = 1.0 * ( 800.0 / - mvPosition.z );
}
