import { THREE } from '../core/scene.js';
import { PHYS_DEFAULTS } from '../core/phys.js';
import { state } from '../core/state.js';

export function getWind(t) {
	if (PHYS_DEFAULTS.windMode === 'steady') return new THREE.Vector3(PHYS_DEFAULTS.steadyWindX, 0, PHYS_DEFAULTS.steadyWindZ);
	const wx = Math.sin(t * 0.4) * 3 + Math.cos(t * 0.13) * 1.2;
	const wz = Math.cos(t * 0.3) * 1.5;
	return new THREE.Vector3(wx, 0, wz);
}

export function airDensityAt(y) {
	const rho = PHYS_DEFAULTS.RHO0 * Math.exp(-Math.max(0, y) / PHYS_DEFAULTS.SCALE_HEIGHT);
	return THREE.MathUtils.clamp(rho, 0.3, PHYS_DEFAULTS.RHO0);
}

export function initWindParticles() {
	state.windParticles = new THREE.Group();
	state.scene.add(state.windParticles);
	const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 });
	for (let i = 0; i < state.WIND_COUNT; i++) {
		const g = new THREE.PlaneGeometry(0.6, 2.2);
		const m = new THREE.Mesh(g, mat.clone());
		m.position.set(THREE.MathUtils.randFloatSpread(800), THREE.MathUtils.randFloat(5, 1800), THREE.MathUtils.randFloatSpread(800));
		m.rotation.x = -Math.PI / 2;
		m.userData.wobble = Math.random() * Math.PI * 2;
		m.userData.speed = THREE.MathUtils.randFloat(0.5, 2);
		state.windParticles.add(m);
	}
}

export function updateWindParticles(dt) {
	const wind = getWind(state.windTimer);
	state.windParticles.children.forEach((m) => {
		const wob = Math.sin(performance.now() * 0.002 + m.userData.wobble) * 0.6;
		m.position.addScaledVector(wind.clone().multiplyScalar(m.userData.speed), dt * 2.0);
		m.position.x += wob * dt * 6;
		m.position.z += Math.cos(performance.now() * 0.001 + m.userData.wobble) * 0.4;
		if (m.position.x > 500) m.position.x = -500;
		if (m.position.x < -500) m.position.x = 500;
		if (m.position.z > 500) m.position.z = -500;
		if (m.position.z < -500) m.position.z = 500;
	});
}


