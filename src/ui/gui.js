import GUI from 'three/addons/libs/lil-gui.module.min.js';
import { PHYS_DEFAULTS } from '../core/phys.js';
// Local GUI state for tunable parameters
const guiState = {
    // Air & Atmosphere
    RHO0: 1.15,
    SCALE_HEIGHT: 8500,
    Cd_body: 0.9,
    Area_body: 0.7,
    Cd_canopy: 1.6,
    Area_canopy: 40,

    // Mass & Gravity
    mass: 80,
    GRAVITY_Y: -9.81,

    // Wind
    windMode: 'dynamic',
    steadyWindX: 3,
    steadyWindZ: 1,

    // Auto Open
    autoOpen: true,
    autoOpenAltitude: 120,

    // Parachute Specifications
    radius_parachute: 50, // cm
    k: 0.7, // drag coefficient
    thik: 15, // cm - parachute thickness
    parachute_tall: 100, // cm - rectangular parachute length
    parachute_width: 20, // cm - rectangular parachute width
    shape_of_parachute: false, // false = circular, true = rectangular

    // Person Dimensions
    per_tall: 100, // cm - person height
    per_wid: 30, // cm - person width
    per_thik: 25, // cm - person thickness
};

export function initGUI() {
    const gui = new GUI({ title: 'Physics & Visual Controls' });
    gui.domElement.style.position = 'fixed';
    gui.domElement.style.top = '10px';
    gui.domElement.style.right = '10px';
    gui.domElement.style.zIndex = '10000';

    const fAir = gui.addFolder('Air & Atmosphere');
    fAir.add(guiState, 'RHO0', 0.5, 1.6, 0.005).onChange(v => PHYS_DEFAULTS.RHO0 = v);
    fAir.add(guiState, 'SCALE_HEIGHT', 3000, 12000, 50).onChange(v => PHYS_DEFAULTS.SCALE_HEIGHT = v);
    fAir.add(guiState, 'Cd_body', 0.1, 2.5, 0.05).onChange(v => PHYS_DEFAULTS.Cd_body = v);
    fAir.add(guiState, 'Area_body', 0.2, 1.5, 0.05).onChange(v => PHYS_DEFAULTS.Area_body = v);
    fAir.add(guiState, 'Cd_canopy', 0.5, 3.5, 0.05).onChange(v => PHYS_DEFAULTS.Cd_canopy = v);
    fAir.add(guiState, 'Area_canopy', 10, 80, 1).onChange(v => PHYS_DEFAULTS.Area_canopy = v);

    const fGrav = gui.addFolder('Mass & Gravity');
    fGrav.add(guiState, 'mass', 40, 140, 1).onChange(v => PHYS_DEFAULTS.mass = v);
    fGrav.add(guiState, 'GRAVITY_Y', -20, -1, 0.1).onChange(v => PHYS_DEFAULTS.GRAVITY_Y = v);

    const fWind = gui.addFolder('Wind');
    fWind.add(guiState, 'windMode', { dynamic: 'dynamic', steady: 'steady' }).onChange(v => PHYS_DEFAULTS.windMode = v);
    fWind.add(guiState, 'steadyWindX', -10, 10, 0.1).onChange(v => PHYS_DEFAULTS.steadyWindX = v);
    fWind.add(guiState, 'steadyWindZ', -10, 10, 0.1).onChange(v => PHYS_DEFAULTS.steadyWindZ = v);

    const fAuto = gui.addFolder('Auto Open');
    fAuto.add(guiState, 'autoOpen').onChange(v => PHYS_DEFAULTS.autoOpen = v);
    fAuto.add(guiState, 'autoOpenAltitude', 20, 800, 1).onChange(v => PHYS_DEFAULTS.autoOpenAltitude = v);

    // Parachute specifications folder
    const fParaSpecs = gui.addFolder('Parachute Specifications');
    fParaSpecs.add(guiState, 'shape_of_parachute', { 'Circular': false, 'Rectangular': true }).onChange(v => {
        updateParachuteArea();
    });
    fParaSpecs.add(guiState, 'radius_parachute', 50, 450, 1).onChange(v => {
        updateParachuteArea();
    });
    fParaSpecs.add(guiState, 'k', 0.7, 1.4, 0.1).onChange(v => {
        // Update drag coefficients
        PHYS_DEFAULTS.Cd_body = v;
        PHYS_DEFAULTS.Cd_canopy = v * 1.5; // Canopy has higher drag
    });
    fParaSpecs.add(guiState, 'thik', 0, 200, 1).onChange(v => {
        updateParachuteArea();
    });
    fParaSpecs.add(guiState, 'parachute_tall', 0, 1000, 1).onChange(v => {
        updateParachuteArea();
    });
    fParaSpecs.add(guiState, 'parachute_width', 0, 1000, 1).onChange(v => {
        updateParachuteArea();
    });

    // Person dimensions folder
    const fPerson = gui.addFolder('Person Dimensions');
    fPerson.add(guiState, 'per_tall', 0, 200, 1).onChange(v => {
        updatePersonArea();
    });
    fPerson.add(guiState, 'per_wid', 3, 200, 1).onChange(v => {
        updatePersonArea();
    });
    fPerson.add(guiState, 'per_thik', 5, 200, 1).onChange(v => {
        updatePersonArea();
    });
}

// Helper function to update parachute area based on shape and dimensions
function updateParachuteArea() {
    if (guiState.shape_of_parachute === false) {
        // Circular parachute
        const area = (Math.PI * guiState.radius_parachute * guiState.radius_parachute) / 10000; // Convert cm² to m²
        PHYS_DEFAULTS.Area_canopy = area;
    } else {
        // Rectangular parachute
        const area = (guiState.parachute_tall * guiState.parachute_width) / 10000; // Convert cm² to m²
        PHYS_DEFAULTS.Area_canopy = area;
    }
}

// Helper function to update person area
function updatePersonArea() {
    const area = (guiState.per_wid * guiState.per_thik) / 10000; // Convert cm² to m²
    PHYS_DEFAULTS.Area_body = area;
}


