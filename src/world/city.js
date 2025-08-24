import { THREE } from '../core/scene.js';
import { state } from '../core/state.js';

function addBuilding(x, z, w, d, h, color) {
	const geo = new THREE.BoxGeometry(w, h, d);
	const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.1 });
	const m = new THREE.Mesh(geo, mat);
	m.castShadow = true;
	m.receiveShadow = true;
	m.position.set(x, h / 2, z);
	state.scene.add(m);
	const min = new THREE.Vector3(x - w / 2, 0, z - d / 2);
	const max = new THREE.Vector3(x + w / 2, h, z + d / 2);
	state.buildingBounds.push({ min, max, mesh: m, x, z, w, d, h });
}

export function buildCity() {
	const buildingPalette = [0xE8E8E8, 0xD4AF37, 0x4682B4, 0xCD853F, 0x708090, 0xF0E68C, 0xDDA0DD, 0x98FB98, 0xF5DEB3, 0xFFB6C1, 0x87CEEB, 0xDEB887];
	const gridSize = 8;
	const spacing = 120;
	const centerOffset = (gridSize - 1) * spacing / 2;
	for (let i = 0; i < gridSize; i++) {
		for (let j = 0; j < gridSize; j++) {
			if (i === Math.floor(gridSize / 2) && j === Math.floor(gridSize / 2)) continue;
			const x = i * spacing - centerOffset;
			const z = j * spacing - centerOffset;
			const w = THREE.MathUtils.randFloat(25, 45);
			const d = THREE.MathUtils.randFloat(25, 45);
			const h = THREE.MathUtils.randFloat(30, 200);
			const baseColor = buildingPalette[Math.floor(Math.random() * buildingPalette.length)];
			const color = new THREE.Color(baseColor);
			const lightVariation = 0.8 + Math.random() * 0.4;
			color.multiplyScalar(lightVariation);
			addBuilding(x, z, w, d, h, color.getHex());
		}
	}
	// Removed central tower
}


