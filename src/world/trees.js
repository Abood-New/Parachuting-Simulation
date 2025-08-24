import { THREE } from '../core/scene.js';
import { state } from '../core/state.js';

function createTree() {
	const treeGroup = new THREE.Group();
	const trunkHeight = THREE.MathUtils.randFloat(8, 15);
	const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.2, trunkHeight, 8), new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9 }));
	trunk.position.y = trunkHeight / 2;
	trunk.castShadow = true;
	treeGroup.add(trunk);
	const crownHeight = THREE.MathUtils.randFloat(6, 12);
	const crownRadius = THREE.MathUtils.randFloat(4, 8);
	const crown = new THREE.Mesh(new THREE.SphereGeometry(crownRadius, 12, 8), new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(0.25 + Math.random() * 0.1, 0.6, 0.3 + Math.random() * 0.2), roughness: 0.8 }));
	crown.position.y = trunkHeight + crownHeight / 2;
	crown.castShadow = true;
	crown.receiveShadow = true;
	treeGroup.add(crown);
	for (let i = 0; i < 3; i++) {
		const extraLeaves = new THREE.Mesh(new THREE.SphereGeometry(crownRadius * 0.7, 8, 6), crown.material.clone());
		extraLeaves.position.set((Math.random() - 0.5) * crownRadius, trunkHeight + (Math.random() - 0.5) * crownHeight, (Math.random() - 0.5) * crownRadius);
		extraLeaves.castShadow = true;
		treeGroup.add(extraLeaves);
	}
	return treeGroup;
}

export function initTrees() {
	state.treesGroup = new THREE.Group();
	state.scene.add(state.treesGroup);
	state.trees.length = 0;
	for (let i = 0; i < 50; i++) {
		const tree = createTree();
		let validPosition = false;
		let attempts = 0;
		while (!validPosition && attempts < 20) {
			const x = THREE.MathUtils.randFloatSpread(state.groundSize * 0.8);
			const z = THREE.MathUtils.randFloatSpread(state.groundSize * 0.8);
			const onStreet = (Math.abs(x % 120) < 15) || (Math.abs(z % 120) < 15);
			let nearBuilding = false;
			for (const bound of state.buildingBounds) {
				if (x > bound.min.x - 10 && x < bound.max.x + 10 && z > bound.min.z - 10 && z < bound.max.z + 10) { nearBuilding = true; break; }
			}
			if (!onStreet && !nearBuilding) {
				tree.position.set(x, 0, z);
				tree.rotation.y = Math.random() * Math.PI * 2;
				tree.scale.setScalar(0.8 + Math.random() * 0.4);
				validPosition = true;
			}
			attempts++;
		}
		if (validPosition) {
			state.treesGroup.add(tree);
			state.trees.push(tree);
		}
	}
}


