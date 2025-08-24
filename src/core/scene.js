import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { state } from './state.js';

export function initScene() {
	state.scene = new THREE.Scene();


	// const DAY = new THREE.Color(0x87cfe6);
	// state.scene.background = DAY.clone();
	// state.scene.fog = new THREE.FogExp2(state.scene.background, 0.0006);
	// Skybox
	const loader = new THREE.CubeTextureLoader();
	const skybox = loader.load([
		'/skybox/px.png', // right
		'/skybox/nx.png', // left
		'/skybox/py.png', // top
		'/skybox/ny.png', // bottom
		'/skybox/pz.png', // front
		'/skybox/nz.png', // back
	]);
	state.scene.background = skybox;
	state.scene.fog = new THREE.FogExp2(0x87cfe6, 0.0006);


	state.camera = new THREE.PerspectiveCamera(150, window.innerWidth / window.innerHeight, 0.1, 20000);
	safeSetCameraPosition(state.camera, 0, 8, -16);

	state.renderer = new THREE.WebGLRenderer({ antialias: true });
	state.renderer.setSize(window.innerWidth, window.innerHeight);
	state.renderer.shadowMap.enabled = true;
	state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	document.body.appendChild(state.renderer.domElement);

	state.orbitControls = new OrbitControls(state.camera, state.renderer.domElement);
	state.orbitControls.enabled = true;
	state.orbitControls.enableDamping = true;
	state.orbitControls.dampingFactor = 0.07;
	state.orbitControls.target.set(0, 2, 0);

	window.addEventListener('resize', () => {
		state.camera.aspect = window.innerWidth / window.innerHeight;
		state.camera.updateProjectionMatrix();
		state.renderer.setSize(window.innerWidth, window.innerHeight);
	});
}

export function initGroundAndLights() {
	const loader = new THREE.TextureLoader();
	const grass = loader.load('https://threejs.org/examples/textures/terrain/grasslight-big.jpg');
	grass.wrapS = grass.wrapT = THREE.RepeatWrapping;
	grass.repeat.set(state.groundSize / 30, state.groundSize / 30);

	const groundMat = new THREE.MeshStandardMaterial({ map: grass });
	const ground = new THREE.Mesh(new THREE.PlaneGeometry(state.groundSize, state.groundSize), groundMat);
	ground.rotation.x = -Math.PI / 2;
	ground.receiveShadow = true;
	state.scene.add(ground);

	const hemi = new THREE.HemisphereLight(0xffffff, 0x445566, 0.4);
	state.scene.add(hemi);
}

export function renderFrame() {
	state.renderer.render(state.scene, state.camera);
}

export { THREE };

// Utility: Safely set camera position
export function safeSetCameraPosition(camera, x, y, z) {
	if ([x, y, z].every(v => typeof v === 'number' && isFinite(v))) {
		camera.position.set(x, y, z);
	} else {
		console.warn('Attempted to set camera position to non-finite values:', x, y, z);
	}
}


