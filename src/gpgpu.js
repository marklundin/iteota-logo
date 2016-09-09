
import THREE from 'three'
var glslify = require( 'glslify' )


var camera = new THREE.OrthographicCamera( - 0.5, 0.5, 0.5, - 0.5, 0, 1 );



export default( renderer, origin, dimension ) => {

    var front = new THREE.WebGLRenderTarget( dimension[0], dimension[1], { magFilter: THREE.NearestFilter, minFilter: THREE.NearestFilter, format:THREE.RGBFormat, type:THREE.FloatType })
    var back = front.clone()
    var buffers = [ front, back ]


    var material = new THREE.ShaderMaterial({
        // extensions:{
        //     derivatives: true
        // },
        uniforms:{
            uTex: { type: "t", value: buffers[0] },
            uMouse: { type: "v3", value: new THREE.Vector3(0, 0, 0) },
            uMouseVel: { type: "v3", value: new THREE.Vector3(0, 0, 0) },
            uOrigin: { type: "t", value: origin },
            uResolution: { value: new THREE.Vector2( ...dimension ) },
            uTime: { value: 0.0 },
            uConverge: { value: 0.0 }
        },
        fragmentShader:glslify( './gpgpu.frag' ),
        // vertexShader:glslify('./gpu-point.vert'),
        // blending: THREE.AdditiveBlending,
        // blendSrc: THREE.SrcAlphaFactor,
        // blendDst: THREE.OneFactor,
        depthWrite: false,
        depthTest: false,
        transparent : false,
        // alphaTest: 0.5
    });

    let swap = _ => {
        let tmp = buffers[0]
        buffers[0] = buffers[1]
        buffers[1] = tmp
        return { source:buffers[0], target:buffers[1]}
    }

    let scene = new THREE.Scene(),
        mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1, 1 ), material ),
        mouseLast = new THREE.Vector3(),
        target

    scene.add( mesh );

    let step = ( override, t, converge, mouse = new THREE.Vector3() ) => {
        // console.log( material.uniforms.uTime.value)
        let { source, target } = swap()
        material.uniforms.uTime.value = t
        material.uniforms.uMouse.value.copy( mouse )
        material.uniforms.uMouseVel.value.subVectors( mouse, mouseLast )
        // material.uniforms.uMouseVel.value.multiplyScalar( 0.56 )
        material.uniforms.uConverge.value = converge || 0
        material.uniforms.uTex.value = override || source
        renderer.render( scene, camera, target, false );
        // console.log( material.uniforms.uTime.value)
        mouseLast.copy( mouse )
        return target

    }

    return step
}
