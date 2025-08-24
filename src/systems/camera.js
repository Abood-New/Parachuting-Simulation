import { THREE, safeSetCameraPosition } from '../core/scene.js';
import { state } from '../core/state.js';

export function initCameraState() {
	state.cameraOffset = new THREE.Vector3(0, 2.8, -6.8);
	state.cameraOffsetTarget = state.cameraOffset.clone();
	state.cameraFOVTarget = state.camera.fov;
}

export function setCameraTargets(offset, fov) {
	state.cameraOffsetTarget.copy(offset);
	state.cameraFOVTarget = fov;
}

export function cameraShake(strength, ms) {
	state.shakeStr = Math.max(state.shakeStr, strength);
	state.shakeEnd = performance.now() + ms;
}

function applyCameraShake(target) {
	const now = performance.now();
	if (now > state.shakeEnd) { state.shakeStr = 0; return target; }
	const t = (state.shakeEnd - now) / 300;
	const s = state.shakeStr * Math.max(0, t);
	const jitter = new THREE.Vector3((Math.random() - 0.5) * s, (Math.random() - 0.5) * s * 0.6, (Math.random() - 0.5) * s);
	return target.clone().add(jitter);
}

// Utility function to validate vector components
function isValidVector(vec) {
	return vec &&
		typeof vec.x === 'number' && isFinite(vec.x) &&
		typeof vec.y === 'number' && isFinite(vec.y) &&
		typeof vec.z === 'number' && isFinite(vec.z);
}

export function updateCamera() {
	if (state.cameraMode === 'orbit') {
		state.orbitControls.update();
		return;
	}

	// Validate player position and velocity
	if (!isValidVector(state.player.position) || !isValidVector(state.vel)) {
		console.warn('Invalid player position or velocity detected:', state.player.position, state.vel);
		return;
	}

	const targetPos = state.player.position.clone().add(new THREE.Vector3(0, 1.2, 0));
	const forward = state.vel.clone(); forward.y = 0;
	let desiredOffset = state.cameraOffsetTarget.clone();
	const speed = state.vel.length();

	// Validate speed
	if (!isFinite(speed)) {
		console.warn('Invalid speed detected:', speed);
		return;
	}

	const dynamicOffset = new THREE.Vector3(desiredOffset.x, desiredOffset.y + speed * 0.1, desiredOffset.z - speed * 0.2);
	if (forward.length() > 0.1) {
		const ang = Math.atan2(forward.x, forward.z);
		dynamicOffset.applyEuler(new THREE.Euler(0, ang, 0, 'YXZ'));
	}
	state.cameraOffset.lerp(dynamicOffset, 0.08);
	let desiredPos = targetPos.clone().add(state.cameraOffset);
	if (desiredPos.y < 1) desiredPos.y = 1;
	desiredPos = applyCameraShake(desiredPos);

	// Validate final desired position
	if (!isValidVector(desiredPos)) {
		console.warn('Invalid desired camera position:', desiredPos);
		return;
	}

	const lerpFactor = state.parachuteOpen ? 0.06 : state.cameraSmooth;
	state.camera.position.lerp(desiredPos, lerpFactor);

	let adjustedFOV = state.cameraFOVTarget;
	adjustedFOV += state.parachuteOpen ? speed * 0.5 : speed * 0.3;
	adjustedFOV = Math.min(adjustedFOV, 110);
	state.camera.fov += (adjustedFOV - state.camera.fov) * 0.08;
	state.camera.updateProjectionMatrix();

	const lookTarget = targetPos.clone().add(state.vel.clone().multiplyScalar(0.05));

	// Validate look target
	if (isValidVector(lookTarget)) {
		state.camera.lookAt(lookTarget);
	} else {
		console.warn('Invalid look target:', lookTarget);
	}
}


