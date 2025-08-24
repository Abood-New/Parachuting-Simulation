import { THREE } from '../core/scene.js';
import { state } from '../core/state.js';
import { PHYS_DEFAULTS } from '../core/phys.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function buildSimpleAvatar() {
	const group = new THREE.Group();
	const skin = new THREE.MeshStandardMaterial({ color: 0xffe0bd, roughness: 0.6 });
	const cloth = new THREE.MeshStandardMaterial({ color: 0x2f74c0, roughness: 0.7 });
	const dark = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });
	const scale = phys.playerScale;
	const head = new THREE.Mesh(new THREE.SphereGeometry(0.24 * scale, 24, 16), skin); head.position.set(0, 1.65, 0);
	const body = new THREE.Mesh(new THREE.BoxGeometry(0.5 * scale, 0.7 * scale, 0.28 * scale), cloth); body.position.set(0, 1.2, 0);
	const armGeo = new THREE.BoxGeometry(0.14 * scale, 0.5 * scale, 0.14 * scale);
	const armR = new THREE.Mesh(armGeo, skin); armR.position.set(0.34 * scale, 1.25, 0);
	const armL = new THREE.Mesh(armGeo, skin); armL.position.set(-0.34 * scale, 1.25, 0);
	const legGeo = new THREE.BoxGeometry(0.16 * scale, 0.6 * scale, 0.16 * scale);
	const legR = new THREE.Mesh(legGeo, dark); legR.position.set(0.12 * scale, 0.6, 0);
	const legL = new THREE.Mesh(legGeo, dark); legL.position.set(-0.12 * scale, 0.6, 0);
	[head, body, armR, armL, legR, legL].forEach(m => { m.castShadow = true; m.receiveShadow = true; });
	group.add(head, body, armR, armL, legR, legL);
	return { group, armR, armL };
}

export function initPlayer() {
	state.player = new THREE.Group();
	state.scene.add(state.player);
	state.avatar = buildSimpleAvatar();
	state.player.add(state.avatar.group);
	state.fallbackRight = state.avatar.armR;
	state.fallbackLeft = state.avatar.armL;
	state.harnessLocal = [
		new THREE.Vector3(0.22, state.PLAYER_HEIGHT * 0.75, 0.12),
		new THREE.Vector3(-0.22, state.PLAYER_HEIGHT * 0.75, 0.12),
		new THREE.Vector3(0.22, state.PLAYER_HEIGHT * 0.65, -0.12),
		new THREE.Vector3(-0.22, state.PLAYER_HEIGHT * 0.65, -0.12)
	];
}

export async function initPlayerWithModel(modelUrlHref) {
	state.player = new THREE.Group();
	state.scene.add(state.player);
	try {
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
	} catch (err) {
		console.warn('Failed to load player model, fallback to simple avatar:', err);
		const simple = buildSimpleAvatar();
		state.player.add(simple.group);
		state.fallbackRight = simple.armR;
		state.fallbackLeft = simple.armL;
		state.harnessLocal = [
			new THREE.Vector3(0.22, state.PLAYER_HEIGHT * 0.75, 0.12),
			new THREE.Vector3(-0.22, state.PLAYER_HEIGHT * 0.75, 0.12),
			new THREE.Vector3(0.22, state.PLAYER_HEIGHT * 0.65, -0.12),
			new THREE.Vector3(-0.22, state.PLAYER_HEIGHT * 0.65, -0.12)
		];
	}
}


