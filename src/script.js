import * as dat from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import firefliesVertexShader from './shaders/flies/vertex.glsl'
import firefliesFragmentShader from './shaders/flies/fragment.glsl'
import portalVertexShader from './shaders/portal/vertex.glsl'
import portalFragmentShader from './shaders/portal/fragment.glsl'
import { gsap } from 'gsap'

// _________________________________________   BASE 

// Debug object
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// _________________________________________   LOADERS 

// PRE LOADER 
let loaded = false
const loadingManager = new THREE.LoadingManager(
    // Loaded
    () =>
    {
        // Wait a little
        window.setTimeout(() =>
        {
            // Animate overlay
            gsap.to(overlayMaterial.uniforms.uAlpha1, { duration: 2, value: 0, delay: 1 })
        }, 500)
        loaded = true
    }
)

// Texture loader
const textureLoader = new THREE.TextureLoader(loadingManager)

// Draco loader
const dracoLoader = new DRACOLoader(loadingManager)
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)

// _________________________________________   BUTTONS

// mute
const enterButton = document.getElementById('enterButton')
enterButton.addEventListener('click', handleEnterButtonClick)


let audioPlaying = false

function handleEnterButtonClick() {
  enterButton.classList.add('clicked')
  if (!audioPlaying) {
    document.getElementById("enterButton").textContent="🔊"
      sound.play() 
      audioPlaying = true
  }
  else{
    document.getElementById("enterButton").textContent="🔈 "
    sound.pause()
    audioPlaying = false
  }
}

// Music Cred 
const matteButton = document.getElementById('matteButton')
matteButton.addEventListener('click', () => {
    window.open('https://open.spotify.com/artist/5XOKejcvmuUFLv5S7xgsQ8?si=I-qTN1sdRdyDpwhnYiqtKw')
})
const fridaButton = document.getElementById('fridaButton')
fridaButton.addEventListener('click', () => {
    window.open('https://www.fridawiig.xyz')
})

// Visibility on load
if (!loaded)
{
    window.setTimeout(() =>
    {
        enterButton.classList.remove('hidden')
        matteButton.classList.remove('hidden')
        fridaButton.classList.remove('hidden')
        
       
    }, 2000)
}
else{
    enterButton.classList.remove('visible')
    matteButton.classList.remove('visible')
    fridaButton.classList.remove('visible')

}

// _________________________________________   TEXTURES 



// Textures 

const bakedTexture = textureLoader.load('baked2.jpg')
bakedTexture.flipY = false
bakedTexture.colorSpace = THREE.SRGBColorSpace

// Materials 

const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })

// _________________________________________   LIGHTS & SHADERS 

// Portal Shader 
debugObject.portalColorStart = '#fbbcc5'
debugObject.portalColorEnd = '#0a0b24'

const smallLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5} )
const bottomMaterial = new THREE.MeshBasicMaterial({ color: 0x08091b} )

const portalMaterial = new THREE.ShaderMaterial({
    uniforms: 
    {
        uTime: { value: 0 },
        uColorStart: { value: new THREE.Color(debugObject.portalColorEnd) },
        uColorEnd: { value: new THREE.Color(debugObject.portalColorStart) },

    },
    vertexShader: portalVertexShader,
    fragmentShader: portalFragmentShader
} )
portalMaterial.side = THREE.DoubleSide

// Fireflies, particles 

// geometry 
const fliesGeometry = new THREE.BufferGeometry()
const fliesCount = 30 
const positionArray = new Float32Array(fliesCount * 3)
const scaleArray = new Float32Array(fliesCount)

for(let i =0; i < fliesCount; i++)
{
    positionArray[i * 3 + 0] = (Math.random() - 0.5) * 5
    positionArray[i * 3 + 1] = Math.random() *1.5
    positionArray[i * 3 + 2] = (Math.random() -0.5)*3.75

    scaleArray[i] = Math.random()
}

fliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
fliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1))

const fliesMaterial = new THREE.ShaderMaterial({
    uniforms: 
    {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: 145 } // for equal pixel ratio 
    },
    vertexShader: firefliesVertexShader,
    fragmentShader: firefliesFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
})

const flies = new THREE.Points(fliesGeometry, fliesMaterial)
scene.add(flies)

// OVERLAY (AS LOADER)

const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms:
    {
        uAlpha1: { value: 1 }
    },
    vertexShader: `
        void main()
        {
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uAlpha1;

        void main()
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha1);
        }
    `
})
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)


// _________________________________________   LOADER 

// Model 

gltfLoader.load(
    'protal_bottom.glb',
    (gltf) =>
    {
        gltf.scene.traverse((child) =>
        {
            child.material = bakedMaterial
        })
        scene.add(gltf.scene)

        // Get each object
        const portalLightMesh = gltf.scene.children.find((child) => child.name === 'portal')
        const poleLightAMesh = gltf.scene.children.find((child) => child.name === 'poleLightA')
        const poleLightBMesh = gltf.scene.children.find((child) => child.name === 'poleLightB')
        const poleLightCMesh = gltf.scene.children.find((child) => child.name === 'poleLightC')
        const poleLightDMesh = gltf.scene.children.find((child) => child.name === 'poleLightD')
        const poleLightEMesh = gltf.scene.children.find((child) => child.name === 'poleLightE')
        const bottom = gltf.scene.children.find((child) => child.name === 'bottom')

        // Apply materials
        poleLightAMesh.material = smallLightMaterial
        poleLightBMesh.material = smallLightMaterial
        poleLightCMesh.material = smallLightMaterial
        poleLightDMesh.material = smallLightMaterial
        poleLightEMesh.material = smallLightMaterial
        poleLightEMesh.material = smallLightMaterial
        portalLightMesh.material = portalMaterial
        bottom.material = bottomMaterial
    }
)


// _________________________________________   SIZING

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // update fireflies 
    fliesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
})

// _________________________________________   CAMERA 
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 4
camera.position.z = 6
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enablePan = false
controls.maxPolarAngle = Math.PI * 0.5

// _________________________________________   RENDERER 

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Background 
debugObject.clearColor = '#0a0b24'
renderer.setClearColor(0x000000, 0.0) // for gradient

// _________________________________________   AUDIO

const listener = new THREE.AudioListener()
camera.add(listener)

const sound = new THREE.Audio(listener)

// load a sound and set it as the Audio objects buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load( './MistahMath - Nashira.mp3', function( buffer ) {
	sound.setBuffer( buffer )
	sound.setLoop( true )
	sound.setVolume( 0.1 )
})
scene.add(sound)

// _________________________________________   ANIMATE / GAMELOOP / TICK

const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Time to shaders 
    portalMaterial.uniforms.uTime.value = elapsedTime
    fliesMaterial.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()