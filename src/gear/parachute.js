import { THREE } from '../core/scene.js';
import { state } from '../core/state.js';
import { swatheParachute, volumeParachute, PHYS_DEFAULTS } from '../core/phys.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function makeCanopy(radius) {
	if (state.canopy) {
		state.player.remove(state.canopy);
		state.canopy.geometry.dispose();
		state.canopy.material.dispose();
	}
	state.useCanopyModel = false;
	state.canopyAttachNodes = [];
	const segments = 128;
	const rings = 64;
	const geo = new THREE.SphereGeometry(radius, segments, rings, 0, Math.PI * 2, 0, Math.PI / 2.1);
	const positions = geo.attributes.position.array;
	state.canopyOriginalVertices = [];
	state.canopyDeformation = [];
	for (let i = 0; i < positions.length; i += 3) {
		state.canopyOriginalVertices.push({ x: positions[i], y: positions[i + 1], z: positions[i + 2] });
		state.canopyDeformation.push({ x: 0, y: 0, z: 0 });
	}
	geo.translate(0, -radius * 0.8, 0);
	geo.computeVertexNormals();
	const colors = [];
	const posAttr = geo.attributes.position;
	for (let i = 0; i < posAttr.count; i++) {
		const vx = posAttr.getX(i), vz = posAttr.getZ(i), vy = posAttr.getY(i);
		const ang = (Math.atan2(vz, vx) + Math.PI) / (2 * Math.PI);
		const heightFactor = Math.max(0, vy / radius);
		const distFromCenter = Math.sqrt(vx * vx + vz * vz) / radius;
		let hue, saturation, lightness;
		const stripePattern = Math.floor(ang * 16) % 2;
		if (stripePattern === 0) { hue = 0.05 + ang * 0.1; saturation = 0.8 + heightFactor * 0.2; lightness = 0.5 + heightFactor * 0.3; }
		else { hue = 0.6 + ang * 0.1; saturation = 0.7 + heightFactor * 0.3; lightness = 0.4 + heightFactor * 0.4; }
		lightness *= (0.7 + distFromCenter * 0.3);
		const c = new THREE.Color().setHSL(hue, saturation, lightness);
		colors.push(c.r, c.g, c.b);
	}
	geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
	const mat = new THREE.MeshStandardMaterial({ vertexColors: true, transparent: true, opacity: 0.92, side: THREE.DoubleSide, roughness: 0.6, metalness: 0.05, envMapIntensity: 0.4, emissive: new THREE.Color(0x001122), emissiveIntensity: 0.1 });
	state.canopy = new THREE.Mesh(geo, mat);
	state.canopy.castShadow = true;
	state.canopy.receiveShadow = true;
	state.canopy.rotation.x = 0;
	state.canopy.visible = false;
	state.player.add(state.canopy);
}

export function buildRimPoints(count, radius = PHYS_DEFAULTS.canopyRadius, clearanceY = 2.6, playerHeight = 2.8) {
	const arr = [];
	for (let i = 0; i < count; i++) {
		const a = (i / count) * Math.PI * 2;
		const r = radius * 0.82;
		arr.push(new THREE.Vector3(Math.cos(a) * r, playerHeight + clearanceY, Math.sin(a) * r));
	}
	return arr;
}

export function updateCanopyTransform(radius = PHYS_DEFAULTS.canopyRadius, clearanceY = 2.6, playerHeight = 2.8, baseScale = 5, bottomOffsetY = 0.3) {
	if (!state.canopy) return;
	state.canopy.visible = state.parachuteOpen;
	const rimY = playerHeight + clearanceY;
	state.canopy.position.set(0, rimY + radius * 0.2 + bottomOffsetY, 0);
	state.canopy.scale.setScalar((0.25 + 0.75 * state.canopyDeploy) * baseScale);
}

export function updateCanopyDeformation() {
	// Skip deformation for model-based canopies or when mesh geometry is unavailable
	if (!state.canopy || state.useCanopyModel || !state.canopy.geometry) return;
	if (!state.parachuteOpen) return;
	const currentTime = performance.now() * 0.001;
	const windEffect = new THREE.Vector3();
	windEffect.set(Math.sin(state.windTimer * 0.4) * 3 + Math.cos(state.windTimer * 0.13) * 1.2, 0, Math.cos(state.windTimer * 0.3) * 1.5);
	const playerSpeed = state.vel.length();
	const positions = state.canopy.geometry.attributes.position.array;
	for (let i = 0; i < state.canopyOriginalVertices.length; i++) {
		const original = state.canopyOriginalVertices[i];
		const deform = state.canopyDeformation[i];
		const windInfluence = Math.sin(currentTime * 2 + original.x * 0.1) * windEffect.length() * 0.1;
		const speedInfluence = Math.sin(currentTime * 3 + original.z * 0.1) * playerSpeed * 0.02;
		deform.x = windInfluence * 0.5;
		deform.y = speedInfluence;
		deform.z = Math.cos(currentTime * 1.5 + original.x * 0.1) * windEffect.length() * 0.05;
		const index = i * 3;
		positions[index] = original.x + deform.x;
		positions[index + 1] = original.y + deform.y;
		positions[index + 2] = original.z + deform.z;
	}
	state.canopy.geometry.attributes.position.needsUpdate = true;
	state.canopy.geometry.computeVertexNormals();
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
	const horizontalRadius = Math.max(size.x, size.z) * 0.5 || 1;
	const desiredRadius = PHYS_DEFAULTS.canopyRadius;
	state.canopyBaseScale = 7;
	model.scale.setScalar(state.canopyBaseScale);

	// Recompute bounds after scaling to align bottom to clearance height
	const scaledBox = new THREE.Box3().setFromObject(model);
	const bottomY = 1.5;
	// We want the canopy to sit centered above harness; minor offset can be tuned from GUI if needed
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


