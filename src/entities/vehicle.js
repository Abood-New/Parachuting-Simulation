import { THREE } from '../core/scene.js';
import { state } from '../core/state.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export async function loadHelicopter(modelUrlHref) {
    if (state.helicopter) {
        state.scene.remove(state.helicopter);
    }
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(modelUrlHref);
    const heli = gltf.scene || (gltf.scenes && gltf.scenes[0]);
    if (!heli) throw new Error('Helicopter GLTF has no scene');
    heli.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    state.helicopter = heli;
    state.scene.add(heli);

    let seat = null;
    heli.traverse(o => {
        const n = (o.name || '').toLowerCase();
        if (!seat && (n.includes('seat') || n.includes('pilot') || n.includes('cockpit'))) seat = o;
    });
    state.heliSeatNode = seat || heli;

    heli.position.set(0, state.launchTowerHeight + 4, 0);
    heli.rotation.y = 0;
}

export function attachPlayerToHelicopter() {
    if (!state.helicopter) return;
    state.inVehicle = true;

    const seatWorld = state.heliSeatNode.getWorldPosition(new THREE.Vector3());
    state.pos.copy(seatWorld);
    state.vel.set(0, 0, 0);
    state.acc.set(0, 0, 0);
}

export function detachPlayerFromHelicopter() {
    state.inVehicle = false;
    if (state.player) {
        state.player.visible = true;
    }
}


