import { THREE, initScene, initGroundAndLights, renderFrame } from './core/scene.js';
import { state } from './core/state.js';
import { phys } from './core/phys.js';
import { PHYS_DEFAULTS } from './core/phys.js';
import { buildCity } from './world/city.js';
import { initTrees } from './world/trees.js';
import { initPlayerWithModel } from './entities/player.js';
import { makeCanopy, buildRimPoints, updateCanopyTransform, loadCanopyModel } from './gear/parachute.js';
import { updateRopes } from './gear/ropes.js';
import { initWindParticles, updateWindParticles, getWind } from './systems/wind.js';
import { initHUD, updateHUD } from './ui/hud.js';
import { initCameraState, setCameraTargets, updateCamera } from './systems/camera.js';
import { initControls } from './systems/controls.js';
import { collide } from './systems/collision.js';
import { computeMoveInput, applyAerodynamics, updateArms } from './systems/aero.js';
import { initAudio } from './systems/sound.js';
import { initGUI } from './ui/gui.js';
import { loadHelicopter, attachPlayerToHelicopter, detachPlayerFromHelicopter } from './entities/vehicle.js';

(async () => {
    initScene();
    initGroundAndLights();
    buildCity();
    initTrees();
    const modelUrl = new URL('./mod/Soldier.gltf', import.meta.url).href;
    await initPlayerWithModel(modelUrl);
    // Hide player initially (inside helicopter)
    state.player.visible = false;

    try {
        const canopyUrl = new URL('./mod/army_parachute.glb', import.meta.url).href;
        await loadCanopyModel(canopyUrl);
    } catch (e) {
        console.log('Failed to load canopy model, building procedural canopy', e);
        makeCanopy(PHYS_DEFAULTS.canopyRadius || 9.2);
    }
    // state.ropeAttachLocal = buildRimPoints(phys.ropeCount);
    // updateRopes();

    // Load helicopter and place player inside
    try {
        const heliUrl = new URL('./mod/army_helicopter.glb', import.meta.url).href; // place your model
        await loadHelicopter(heliUrl);
        attachPlayerToHelicopter();
        // Player is inside helicopter, keep hidden
        state.player.visible = false;
    } catch (e) {
        console.log('Failed to load helicopter model', e);
    }

    initWindParticles();
    initHUD();
    initCameraState();
    initControls();
    initAudio();
    initGUI();

    state.pos = new THREE.Vector3(0, state.launchTowerHeight + state.PLAYER_RADIUS + 1, 0);
    state.vel = new THREE.Vector3(0, 0, 0);
    state.acc = new THREE.Vector3(0, 0, 0);
    state.onGround = false;
    state.player.position.copy(state.pos);
    setCameraTargets(new THREE.Vector3(0.5, 1.6, -4.8), 80);

    let last = performance.now();
    function step() {
        const now = performance.now();
        let dt = (now - last) / 1000; if (dt > 0.06) dt = 0.06; last = now;
        updateWindParticles(dt);
        state.acc.set(0, 0, 0);
        if (!state.inVehicle) state.acc.y += PHYS_DEFAULTS.gravity;
        const desired = computeMoveInput();
        const horizVel = new THREE.Vector3(state.vel.x, 0, state.vel.z);
        const diff = desired.clone().sub(horizVel);
        state.acc.add(diff.clone().clampLength(0, 40));
        updateCanopyTransform();
        applyAerodynamics(dt);
        state.vel.addScaledVector(state.acc, dt);
        state.pos.addScaledVector(state.vel, dt);

        // Validate position and velocity after physics update
        if (!isFinite(state.pos.x) || !isFinite(state.pos.y) || !isFinite(state.pos.z) ||
            !isFinite(state.vel.x) || !isFinite(state.vel.y) || !isFinite(state.vel.z)) {
            console.warn('Invalid position or velocity detected, resetting:', state.pos, state.vel);
            state.pos.set(0, state.launchTowerHeight + state.PLAYER_RADIUS + 1, 0);
            state.vel.set(0, 0, 0);
            state.acc.set(0, 0, 0);
        }

        const curMax = state.parachuteOpen ? (state.keys.shift ? 12 : 6) : (state.keys.shift ? 16 : 10);
        const hs = Math.hypot(state.vel.x, state.vel.z);
        if (hs > curMax) { state.vel.x *= curMax / hs; state.vel.z *= curMax / hs; }
        if (!state.inVehicle) {
            collide(state.pos, state.PLAYER_RADIUS);
            if (state.pos.y < state.PLAYER_RADIUS) state.pos.y = state.PLAYER_RADIUS;
        }
        state.player.position.copy(state.pos);
        updateArms(dt);
        updateCamera();
        state.windTimer += dt;
        updateHUD(getWind(state.windTimer));
        renderFrame();
        requestAnimationFrame(step);
    }

    step();
})();

