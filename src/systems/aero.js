import { THREE } from '../core/scene.js';
import { state } from '../core/state.js';
import { swatheParachute, volumeParachute, dragForce, netForce, PHYS_DEFAULTS } from '../core/phys.js';
import { getWind, airDensityAt } from './wind.js';
import { setCameraTargets } from './camera.js';
import { createRopes, disposeRopes } from '../gear/ropes.js';

export function computeMoveInput() {
	const k = state.keys;
	const cur = state.parachuteOpen ? { walk: 6, run: 12 } : { walk: 10, run: 16 };
	const baseSpeed = k.shift ? cur.run : cur.walk;
	const responsiveness = state.parachuteOpen ? 1.2 : 1.0;
	const dir = new THREE.Vector3((k.a ? 1 : 0) - (k.d ? 1 : 0), 0, (k.w ? 1 : 0) - (k.s ? 1 : 0));
	if (dir.lengthSq() > 0) dir.normalize();
	const camDir = new THREE.Vector3();
	state.camera.getWorldDirection(camDir); camDir.y = 0; camDir.normalize();
	const camRight = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), camDir).normalize();
	const move = new THREE.Vector3().addScaledVector(camRight, dir.x).addScaledVector(camDir, dir.z);
	if (move.lengthSq() > 0) move.normalize();
	return move.multiplyScalar(baseSpeed * responsiveness);
}

export function updateArms(dt) {
	const target = state.parachuteOpen ? 1 : 0;
	state.armsRaise = (state.armsRaise || 0);
	state.armsRaise += (target - state.armsRaise) * Math.min(1, dt * 6);
	const rotUp = THREE.MathUtils.degToRad(70) * state.armsRaise;
	const rotOut = THREE.MathUtils.degToRad(10) * state.armsRaise;
	if (state.fallbackRight) { state.fallbackRight.rotation.x = -rotUp; state.fallbackRight.rotation.z = -rotOut; }
	if (state.fallbackLeft) { state.fallbackLeft.rotation.x = -rotUp; state.fallbackLeft.rotation.z = rotOut; }
}

export function applyAerodynamics(dt) {
	// When in vehicle, just keep player attached (no gravity / forces)
	if (state.inVehicle) {
		state.acc.set(0, 0, 0);
		state.vel.set(0, 0, 0);
		return;
	}
	state.windTimer += dt;
	const wind = getWind(state.windTimer);
	const rho = airDensityAt(state.pos.y);
	if (PHYS_DEFAULTS.autoOpen && !state.parachuteOpen && state.canopyTarget === 0 && state.vel.y < -1 && state.pos.y <= PHYS_DEFAULTS.autoOpenAltitude) {
		state.canopyTarget = 1;
	}
	const rate = (state.canopyTarget > state.canopyDeploy) ? PHYS_DEFAULTS.Open_rate : PHYS_DEFAULTS.Close_rate;
	state.canopyDeploy = THREE.MathUtils.clamp(state.canopyDeploy + Math.sign(state.canopyTarget - state.canopyDeploy) * rate * dt, 0, 1);
	const wasOpen = state.parachuteOpen;
	state.parachuteOpen = state.canopyDeploy > 0.04;
	const relVel = state.vel.clone().sub(wind);
	const speed = relVel.length();
	if (speed > 1e-4) {
		const opp = relVel.clone().normalize().negate();
		const areaEff = THREE.MathUtils.lerp(PHYS_DEFAULTS.Area_body, PHYS_DEFAULTS.Area_canopy, state.canopyDeploy);
		const cdEff = THREE.MathUtils.lerp(PHYS_DEFAULTS.Cd_body, PHYS_DEFAULTS.Cd_canopy, state.canopyDeploy);
		const cdWithTurbulence = cdEff * (1 + Math.sin(state.windTimer * 2) * 0.05);
		const dragMag = 0.5 * rho * cdWithTurbulence * areaEff * speed * speed / PHYS_DEFAULTS.mass;
		state.acc.addScaledVector(opp, dragMag);
		if (state.parachuteOpen) {
			const sink = Math.max(0, -relVel.y);
			const angleOfAttack = Math.abs(relVel.y / speed);
			const liftEfficiency = 1 - angleOfAttack * 0.3;
			state.acc.y += PHYS_DEFAULTS.Lift_gain * sink * state.canopyDeploy * liftEfficiency;
			const horiz = new THREE.Vector3(relVel.x, 0, relVel.z);
			if (horiz.lengthSq() > 1e-6) {
				const fwd = horiz.normalize().negate();
				const glideEfficiency = Math.max(0.3, 1 - angleOfAttack);
				state.acc.addScaledVector(fwd, PHYS_DEFAULTS.Glide_gain * sink * state.canopyDeploy * glideEfficiency);
			}
			let steer = 0; if (state.keys.q) steer -= 1; if (state.keys.e) steer += 1;
			if (steer !== 0) {
				let forward = new THREE.Vector3(state.vel.x, 0, state.vel.z);
				if (forward.lengthSq() < 1e-4) { state.camera.getWorldDirection(forward); forward.y = 0; }
				if (forward.lengthSq() > 0) forward.normalize();
				const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), forward).normalize();
				const steerEffectiveness = Math.min(1, speed / 8);
				state.acc.addScaledVector(right, (steer * PHYS_DEFAULTS.Steer_force_N / PHYS_DEFAULTS.mass) * state.canopyDeploy * steerEffectiveness);
				state.player.rotation.z = THREE.MathUtils.lerp(state.player.rotation.z, -steer * 0.45, 0.12);
			}
			if (state.keys.ArrowDown) state.acc.y -= PHYS_DEFAULTS.Dive_gain * state.canopyDeploy;
			if (state.keys.z) state.acc.y += PHYS_DEFAULTS.Flare_gain * state.canopyDeploy;
		}
	}
	const windForce = wind.clone().multiplyScalar(0.08 / PHYS_DEFAULTS.mass);
	const turbulence = new THREE.Vector3((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.3).multiplyScalar(state.canopyDeploy * (state.vel.length()) * 0.005);
	state.acc.add(windForce).add(turbulence);
	if (state.parachuteOpen !== wasOpen) {
		if (state.parachuteOpen) {
			createRopes();
			setCameraTargets(new THREE.Vector3(0, 4.8, -12.5), 74);
		} else {
			disposeRopes();
			setCameraTargets(new THREE.Vector3(0, 2.8, -6.8), 80);
		}
	}
}


