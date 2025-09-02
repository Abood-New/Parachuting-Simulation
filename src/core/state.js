// Central shared state across modules
export const state = {
	scene: null,
	camera: null,
	renderer: null,
	orbitControls: null,
	cameraMode: 'chase',

	groundSize: 2200,
	launchTowerHeight: 1000,
	buildingBounds: [],

	treesGroup: null,
	trees: [],

	player: null,
	PLAYER_RADIUS: 1.2,
	PLAYER_HEIGHT: 2.8,
	avatar: null,
	fallbackRight: null,
	fallbackLeft: null,
	harnessLocal: [],

	canopy: null,
	canopyOriginalVertices: [],
	canopyDeformation: [],
	canopyAttachNodes: [],
	useCanopyModel: false,
	canopyBaseScale: 5,
	canopyBottomOffsetY: 0.3,

	// Vehicle (helicopter)
	helicopter: null,
	heliSeatNode: null,
	inVehicle: false,
	ropeAttachLocal: [],
	ropeMeshes: [],
	ropeSwayOffsets: [],

	windParticles: null,
	WIND_COUNT: 450,

	pos: null,
	vel: null,
	acc: null,

	canopyDeploy: 0,
	canopyTarget: 0,
	parachuteOpen: false,

	windTimer: 0,
	onGround: true,
	jumpCount: 0,
	maxJump: 1,

	keys: { w: false, a: false, s: false, d: false, shift: false, q: false, e: false, z: false, ArrowDown: false, r: false },

	// Camera helpers
	cameraOffset: null,
	cameraOffsetTarget: null,
	cameraSmooth: 0.09,
	cameraFOVTarget: null,
	shakeStr: 0,
	shakeEnd: 0,

	// Player death state
	playerDead: false
};


