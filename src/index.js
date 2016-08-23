import THREE from 'three'
import OrbitControls from './OrbitControls'
import gpu from './gpgpu'
import { TweenLite } from 'gsap'
var glslify = require( 'glslify' )
var logoFrag = glslify( './logo.fs' )
var logoVert = glslify( './logo.vs' )



var renderer = new THREE.WebGLRenderer({alpha:false})
var camera = new THREE.PerspectiveCamera( 90, window.innerWidth/window.innerHeight)
var scene = new THREE.Scene()
// var controls = new THREE.OrbitControls( camera, renderer.domElement )



renderer.setClearColor( 0x222222 )


// Image
var image = new Image()
image.onload = _ => {

    var canvas = document.createElement('canvas');
    var ctx    = canvas.getContext('2d');

    canvas.width = image.width
    canvas.height = image.height

    // 2) Copy your image data into the canvas
    ctx.drawImage( image, 0, 0 );

    var w = image.width, h=image.height;
    var imageData = ctx.getImageData(0,0,w,h)
    //
    // document.body.appendChild( canvas )

    var pixels = imageData.data;
    var w = imageData.width;
    var h = imageData.height;

    // console.log( pixels.filter( c => c > 0 ).length, pixels.length )

    var geometry = new THREE.BufferGeometry();

    var l = w * h;
    var vertices = []
    var uvs = []

    for( var px=0,ct=w*h*4;px<ct;px+=4 ){

        if( pixels[px] > 128 ){
            let i = px/4
            var y = parseInt(i / w, 10);
            var x = i - y * w;

			vertices.push(( x - (w/2)) );
            vertices.push(( h -  y - (h/2)));
            vertices.push( 0 );
            // vertices.push( 0 );
        }
    }

    let mix  = ( n, a, b ) => a * ( 1 - n ) + b * n;


    var altPositions = []
    var len = vertices.length/3
    var l = len
    var laps = 100
    var step = Math.PI * 2.0 / l * laps
    var minRadius = 140, maxRadius = 310, radius = 0
    while( l-- >= 0 ){
        radius = mix( l / len, minRadius, maxRadius )
        // console.log( radius)
        altPositions.push( Math.sin( step * l ) * radius )
        altPositions.push( Math.cos( step * l ) * radius )
        altPositions.push((len-l)* 0.01)
    }



    console.log( 'num particles', len )
    var texSize = Math.ceil( Math.sqrt( len ))
    console.log( 'gpu texsize', texSize, '^2' )

    var floatVertices = new Float32Array( texSize*texSize*3 )
    floatVertices.set( vertices )

    var altFloatVertices = new Float32Array( texSize*texSize*3 )
    altFloatVertices.set( altPositions )

    var x = texSize
    var y = texSize

    for ( let x = 0 ; x<=texSize; x++ ){
        for ( let y = 0 ; y<=texSize; y++ ){
            uvs.push(x/texSize - 0.04)
            uvs.push(y/texSize - 0.04)
        }
    }


    geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( vertices ), 3 ) );
    geometry.addAttribute( 'uvs', new THREE.BufferAttribute( new Float32Array( uvs ), 2 ) );
    geometry.addAttribute( 'altPosition', new THREE.BufferAttribute( new Float32Array( altPositions ), 3 ) );

    let data = new THREE.DataTexture( altFloatVertices, texSize, texSize, THREE.RGBFormat, THREE.FloatType )
    let logoData = new THREE.DataTexture( floatVertices, texSize, texSize, THREE.RGBFormat, THREE.FloatType )

    data.needsUpdate = true
    logoData.needsUpdate = true

    document.body.appendChild( renderer.domElement )

    // var rt = new THREE.WebGLRenderTarget( texSize, texSize, { magFilter: THREE.NearestFilter, minFilter: THREE.NearestFilter, format:THREE.RGBFormat, type:THREE.FloatType })

    let stepGPU = gpu( renderer, logoData, [texSize, texSize] )
    var output = stepGPU( data, 0 )

    var step

    var material = new THREE.ShaderMaterial({
        extensions:{
            derivatives: true
        },
        uniforms:{
            uTex: { type: "t", value: output.texture },
            uOpacity: { value: 0.3 },
            uTime: { value: 0.0 }
        },
        fragmentShader:glslify('./point.frag'),
        vertexShader:glslify('./point.vert'),
        blending: THREE.AdditiveBlending,
        // blendSrc: THREE.SrcAlphaFactor,
        // blendDst: THREE.OneFactor,
        depthWrite: false,
        depthTest: false,
        transparent : true,
        alphaTest: 0.5,
    });


    var particles = new THREE.Points( geometry, material );
    scene.add( particles );



    var logo = new THREE.Mesh( new THREE.PlaneGeometry( image.width, image.height ), new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load( 'assets/single-line.png' ),
        transparent: true,
        depthWrite:false,
        blending: THREE.AdditiveBlending,
        opacity: 0.0
    }))
    // logo.scale.set( 0.65, 0.65, 0.65 )


    // camera.position.z = 450
    camera.lookAt( scene )

    // scene.add( logo )


    function resize(){

        let w = window.innerWidth,
            h = window.innerHeight

        camera.aspect = w/h
        camera.updateProjectionMatrix()

        renderer.setSize( w, h )


    }

    var prop = { converge: 0.0 }


        TweenLite.to( logo.material, 2, { opacity: 0.95, delay: 8, onComplete:_=>{
            // document.onclick = _ => {

                TweenLite.to( prop, 10, { converge: 1})
                    // TweenLite.to( logo.material, 2, { opacity: 0.0, delay:10})
                    // TweenLite.to( material.uniforms.uOpacity, 2, { value: 0.0, delay: 10 })

            // }
        } })



    TweenLite.to( camera.position, 6, { z: 550 })



    // TweenLite.to( logo,mate, 10, { converge: 1, delay:7 })
    // }

    var mx = 0
    var my = 0
    document.onmousemove = function( e){
        // console.log( e )
        mx = ( e.screenX / window.innerWidth  ) * 0.3 - 0.15
        my = ( e.screenY / window.innerHeight ) * 0.3 - 0.15
        mx *=-1
        my *=-1
        // my = window.innerHeight * 0.01


    }

    function render( t ){

        scene.rotation.y += ( mx - scene.rotation.y ) * 0.01
        scene.rotation.x += ( my - scene.rotation.x ) * 0.01

        material.uniforms.uTex.value = stepGPU( null, t*0.005, prop.converge )
        // controls.update( t )
        renderer.render( scene, camera )
        requestAnimationFrame( render )
    }


    resize()
    render( Date.now() )

}

image.src =  'assets/single-line.png'
