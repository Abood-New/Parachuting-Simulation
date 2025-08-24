import { THREE } from '../core/scene.js';
import { state } from '../core/state.js';
import { cameraShake, setCameraTargets } from './camera.js';
import { triggerParachuteOpenFX } from '../systems/sound.js';
import { detachPlayerFromHelicopter } from '../entities/vehicle.js';

export function initControls() {
	window.addEventListener('keydown', (e) => {
		const k = e.key.toLowerCase();
		if (k in state.keys) state.keys[k] = true;
		if (e.key === 'ArrowDown') state.keys.ArrowDown = true;
		if (e.key.toLowerCase() === 'v') {
			state.cameraMode = state.cameraMode === 'chase' ? 'orbit' : 'chase';
			state.orbitControls.enabled = state.cameraMode === 'orbit';
			if (state.cameraMode === 'orbit') state.orbitControls.target.copy(state.player.position).add(new THREE.Vector3(0, 1.2, 0));
		}
		if (e.key === ' ' && state.jumpCount < state.maxJump && state.onGround) {
			state.vel.y = 12.0;
			state.onGround = false;
			state.jumpCount++;
			cameraShake(0.3, 150);
		}
		if (k === 'p' && !state.onGround && state.vel.y < -1) {
			state.canopyTarget = state.canopyTarget > 0 ? 0 : 1;
			cameraShake(0.55, 220);
			if (state.canopyTarget > 0) triggerParachuteOpenFX();
		}
		if (k === 'j') {
			if (state.inVehicle) {
				detachPlayerFromHelicopter();
				cameraShake(0.5, 220);
				state.vel.add(new THREE.Vector3(THREE.MathUtils.randFloat(-2, 2), THREE.MathUtils.randFloat(1, 3), THREE.MathUtils.randFloat(-2, 2)));
			} else {
				state.vel.add(new THREE.Vector3(THREE.MathUtils.randFloat(-5, 5), THREE.MathUtils.randFloat(2, 5), THREE.MathUtils.randFloat(-5, 5)));
			}
		}
		if (k === 'r') {
			resetPosition();
		}
	});
	window.addEventListener('keyup', (e) => {
		const k = e.key.toLowerCase();
		if (k in state.keys) state.keys[k] = false;
		if (e.key === 'ArrowDown') state.keys.ArrowDown = false;
	});
}

export function resetPosition() {
	const startPos = new THREE.Vector3(0, state.launchTowerHeight + state.PLAYER_RADIUS + 1, 0);
	state.pos.copy(startPos);
	state.vel.set(0, 0, 0);
	state.acc.set(0, 0, 0);
	state.onGround = false;
	state.canopyTarget = 0;
	state.canopyDeploy = 0;
	state.parachuteOpen = false;
	state.playerDead = false;
	setCameraTargets(new THREE.Vector3(0.5, 1.6, -4.8), 78);
}


