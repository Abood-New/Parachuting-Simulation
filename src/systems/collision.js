import { THREE } from '../core/scene.js';
import { state } from '../core/state.js';

export function collide(position, radius) {
	let result = { hit: false, normal: new THREE.Vector3(0, 1, 0), point: position.clone() };
	if (position.y - radius <= 0) {
		result.hit = true; result.point.y = radius; result.normal.set(0, 1, 0); position.y = radius;

		if (Math.abs(state.vel.y) > 14) {
			state.playerDead = true;
		}
		state.vel.y = Math.max(0, state.vel.y * -0.2);
		state.onGround = true; state.jumpCount = 0; state.canopyTarget = 0; return result;
	}
	let landed = false; const eps = 0.05;
	for (const b of state.buildingBounds) {
		const insideXZ = position.x > b.min.x - radius && position.x < b.max.x + radius && position.z > b.min.z - radius && position.z < b.max.z + radius;
		if (insideXZ) {
			const roofY = b.max.y;
			if (position.y - radius <= roofY + eps && state.vel.y <= 0) {
				result.hit = true; result.point.y = roofY + radius; result.normal.set(0, 1, 0); position.y = roofY + radius;
				const centerX = (b.min.x + b.max.x) / 2; const centerZ = (b.min.z + b.max.z) / 2; const attractionStrength = 0.1;
				const deltaX = centerX - position.x; const deltaZ = centerZ - position.z;
				if (Math.abs(deltaX) > 1) { state.vel.x += deltaX * attractionStrength; }
				if (Math.abs(deltaZ) > 1) { state.vel.z += deltaZ * attractionStrength; }
				state.vel.y = Math.max(0, state.vel.y * -0.15); state.vel.x *= 0.7; state.vel.z *= 0.7; landed = true;
			}
		}
		const closest = new THREE.Vector3(
			Math.max(b.min.x, Math.min(position.x, b.max.x)),
			Math.max(b.min.y, Math.min(position.y, b.max.y)),
			Math.max(b.min.z, Math.min(position.z, b.max.z))
		);
		const distSq = closest.distanceToSquared(position);
		if (distSq < radius * radius) {
			const pushDir = position.clone().sub(closest);
			if (pushDir.lengthSq() === 0) pushDir.set(0, 1, 0);
			pushDir.normalize();
			const penetration = radius - Math.sqrt(distSq);
			position.addScaledVector(pushDir, penetration + 0.01);
			const velAlong = pushDir.clone().multiplyScalar(state.vel.dot(pushDir));
			state.vel.sub(velAlong.multiplyScalar(0.9));
		}
	}
	if (landed) { state.onGround = true; state.jumpCount = 0; state.canopyTarget = 0; }
	else state.onGround = false;
	return result;
}


