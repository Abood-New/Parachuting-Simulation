import { THREE } from '../core/scene.js';
import { state } from '../core/state.js';
import { updateCanopyDeformation } from './parachute.js';
import { getWind } from '../systems/wind.js';

// Rope constants
const ROPE_COUNT = 10;
const ROPE_THICKNESS = 0.1;
const ROPE_THICKNESS_TOP = 0.08;
const STRAND_THICKNESS = 0.02;
const STRAND_OFFSET = 0.07;

const _tmpV = new THREE.Vector3();
function alignCylinderBetween(mesh, from, to) {
	const dir = _tmpV.copy(to).sub(from);
	const len = dir.length();
	if (len < 1e-6) { mesh.visible = false; return; }
	mesh.visible = true;
	mesh.scale.set(1, 1, 1);
	mesh.position.copy(from).addScaledVector(dir, 0.5);
	const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
	mesh.setRotationFromQuaternion(quat);
	mesh.scale.y = len;
}

export function createRopes() {
	state.ropeMeshes.forEach(m => { state.scene.remove(m); m.traverse(child => { if (child.isMesh) { child.geometry.dispose(); child.material.dispose(); } }); });
	state.ropeMeshes = [];
	state.ropeSwayOffsets = [];
	for (let i = 0; i < 10; i++) { // Replace phys.ropeCount with 10
		const ropeGroupLocal = new THREE.Group();
		const mainGeo = new THREE.CylinderGeometry(0.1, 0.08, 1, 12, 8, true); // Replace phys.ropeThickness with 0.1, 0.08
		const mainMat = new THREE.MeshStandardMaterial({ color: 0xccaa88, roughness: 0.95, normalScale: new THREE.Vector2(0.5, 0.5) });
		const mainRope = new THREE.Mesh(mainGeo, mainMat);
		for (let j = 0; j < 3; j++) {
			const strandGeo = new THREE.CylinderGeometry(0.02, 0.02, 1, 6, 4); // Replace phys.ropeThickness with 0.02
			const strandMat = new THREE.MeshStandardMaterial({ color: 0xaa9977, roughness: 0.9 });
			const strand = new THREE.Mesh(strandGeo, strandMat);
			const angle = (j / 3) * Math.PI * 2;
			strand.position.set(Math.cos(angle) * 0.07, 0, Math.sin(angle) * 0.07); // Replace phys.ropeThickness with 0.07
			ropeGroupLocal.add(strand);
		}
		ropeGroupLocal.add(mainRope);
		mainRope.castShadow = true;
		mainRope.receiveShadow = true;
		ropeGroupLocal.visible = false;
		state.scene.add(ropeGroupLocal);
		state.ropeMeshes.push(ropeGroupLocal);
		state.ropeSwayOffsets.push({ phase: Math.random() * Math.PI * 2, amplitude: 0.5 + Math.random() * 0.5, frequency: 0.8 + Math.random() * 0.4 });
	}
}

export function disposeRopes() {
	if (!state.ropeMeshes || state.ropeMeshes.length === 0) return;
	state.ropeMeshes.forEach(m => {
		state.scene.remove(m);
		m.traverse(child => { if (child.isMesh) { child.geometry.dispose(); child.material.dispose(); } });
	});
	state.ropeMeshes = [];
	state.ropeSwayOffsets = [];
}

export function updateRopes() {
	if (state.useCanopyModel) return; // no ropes for model canopy
	if (!state.parachuteOpen) return;
	if (!state.canopy || state.ropeMeshes.length === 0) return;
	const playerWorldPos = new THREE.Vector3();
	state.player.getWorldPosition(playerWorldPos);
	state.ropeMeshes.forEach((rope, i) => {
		let canopyAttach;
		if (state.useCanopyModel && state.canopyAttachNodes && state.canopyAttachNodes.length > 0) {
			const node = state.canopyAttachNodes[i % state.canopyAttachNodes.length];
			canopyAttach = node.getWorldPosition(new THREE.Vector3());
		} else {
			const localAttach = state.ropeAttachLocal[i % state.ropeAttachLocal.length];
			canopyAttach = localAttach.clone().applyMatrix4(state.canopy.matrixWorld);
		}
		const harnessPoint = state.harnessLocal[i % state.harnessLocal.length].clone();
		harnessPoint.applyMatrix4(state.player.matrixWorld);
		const time = performance.now() * 0.001;
		const swayX = Math.sin(time * 1.2 + (state.ropeSwayOffsets[i].phase || 0) * 0.5) * 0.3;
		const swayZ = Math.cos(time * 0.8 + (state.ropeSwayOffsets[i].phase || 0) * 0.7) * 0.2;
		const wind = getWind(state.windTimer);
		const windEffect = wind.clone().multiplyScalar(0.15);
		canopyAttach.x += swayX + windEffect.x;
		canopyAttach.z += swayZ + windEffect.z;
		const ropeVector = canopyAttach.clone().sub(harnessPoint);
		const ropeLength = ropeVector.length();
		const naturalLength = 12;
		if (ropeLength > naturalLength) {
			const stretch = (ropeLength - naturalLength) / naturalLength;
			const tension = Math.min(stretch * 0.3, 0.8);
			const tensionVector = ropeVector.clone().normalize().multiplyScalar(tension);
			canopyAttach.sub(tensionVector);
		}
		alignCylinderBetween(rope, harnessPoint, canopyAttach);
		const tensionFactor = Math.min(ropeLength / naturalLength, 1.5);
		rope.scale.set(tensionFactor * 0.8, 1, tensionFactor * 0.8);
	});
	updateCanopyDeformation();
}


