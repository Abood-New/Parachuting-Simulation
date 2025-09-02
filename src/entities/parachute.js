import { THREE } from '../core/scene.js';
import { state } from '../core/state.js';
import { PHYS_DEFAULTS } from '../core/phys.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function updateCanopyTransform(radius = PHYS_DEFAULTS.canopyRadius, clearanceY = 2.6, playerHeight = 2.8, baseScale = 5, bottomOffsetY = 0.3) {
	if (!state.canopy) return;
	state.canopy.visible = state.parachuteOpen;

	const headHeight = playerHeight * 0.9; // Approximately at head level
	const fullDeployHeight = playerHeight + clearanceY + radius * 0.2;

	// Interpolate Y position from head to full deploy position
	const deployY = THREE.MathUtils.lerp(headHeight, fullDeployHeight, state.canopyDeploy);

	// Position slightly behind the player when collapsed (realistic backpack position)
	const deployZ = THREE.MathUtils.lerp(-0.3, 0, state.canopyDeploy);

	state.canopy.position.set(0, deployY + bottomOffsetY, deployZ);
	state.canopy.scale.setScalar((0.1 + 0.9 * state.canopyDeploy) * baseScale);
}
export async function loadCanopyModel(modelUrlHref) {
	if (state.canopy) {
		state.player.remove(state.canopy);
		if (state.canopy.geometry) state.canopy.geometry.dispose();
		if (state.canopy.material) state.canopy.material.dispose();
	}
	const loader = new GLTFLoader();
	const gltf = await loader.loadAsync(modelUrlHref);
	const model = gltf.scene || (gltf.scenes && gltf.scenes[0]);
	if (!model) throw new Error('Parachute GLTF has no scene');
	model.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

	// Scale canopy so its horizontal radius roughly equals phys.canopyRadius
	const box = new THREE.Box3().setFromObject(model);
	const size = new THREE.Vector3(); box.getSize(size);
	state.canopyBaseScale = 7;
	model.scale.setScalar(state.canopyBaseScale);

	const bottomY = 1.5;
	state.canopyBottomOffsetY = bottomY; // lift so bottom touches y=0 in local

	const attachNodes = [];
	model.traverse(o => {
		const n = (o.name || '').toLowerCase();
		if (n.includes('rope') || n.includes('attach') || n.includes('line')) attachNodes.push(o);
	});
	state.canopyAttachNodes = attachNodes;
	state.useCanopyModel = attachNodes.length > 0;
	state.canopy = model;
	state.player.add(state.canopy);
}


