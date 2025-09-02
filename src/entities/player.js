import { THREE } from '../core/scene.js';
import { state } from '../core/state.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export async function initPlayerWithModel(modelUrlHref) {
	state.player = new THREE.Group();
	state.scene.add(state.player);
	const loader = new GLTFLoader();
	const gltf = await loader.loadAsync(modelUrlHref);
	const model = gltf.scene || (gltf.scenes && gltf.scenes[0]);
	if (!model) throw new Error('GLTF has no scene');
	model.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
	const box = new THREE.Box3().setFromObject(model);
	const height = Math.max(0.001, box.max.y - box.min.y);
	const scaleFactor = state.PLAYER_HEIGHT / height;
	model.scale.setScalar(scaleFactor);
	const scaledBox = new THREE.Box3().setFromObject(model);
	model.position.y = -scaledBox.min.y;
	state.player.add(model);
	let right = null, left = null;
	model.traverse((o) => {
		const name = (o.name || '').toLowerCase();
		if (!right && (name.includes('right') && (name.includes('hand') || name.includes('arm') || name.includes('forearm')))) right = o;
		if (!left && (name.includes('left') && (name.includes('hand') || name.includes('arm') || name.includes('forearm')))) left = o;
	});
	state.fallbackRight = right;
	state.fallbackLeft = left;
	state.harnessLocal = [
		new THREE.Vector3(0.22, state.PLAYER_HEIGHT * 0.75, 0.12),
		new THREE.Vector3(-0.22, state.PLAYER_HEIGHT * 0.75, 0.12),
		new THREE.Vector3(0.22, state.PLAYER_HEIGHT * 0.65, -0.12),
		new THREE.Vector3(-0.22, state.PLAYER_HEIGHT * 0.65, -0.12)
	];
}


