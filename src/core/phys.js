export function swatheParachute({ shapeOfParachute, radius, parachuteTall, parachuteWidth }) {
	if (shapeOfParachute === false) {
		return (Math.PI * radius * radius) / 10000;
	} else if (shapeOfParachute === true) {
		return (parachuteTall * parachuteWidth) / 10000;
	} else return 0;
}

export function volumeParachute({ shapeOfParachute, radius, R, parachuteTall, parachuteWidth, thik }) {
	if (shapeOfParachute === false) {
		return ((2 / 3) * Math.PI * ((radius ** 3) - (R ** 3))) / 1000000;
	} else if (shapeOfParachute === true) {
		return (parachuteTall * parachuteWidth * thik) / 1000000;
	} else return 0;
}

export function mParachute(roh, volume) {
	return roh * volume;
}

export function dragForce({ cd, area, velocity, airDensity }) {
	return 0.5 * airDensity * cd * area * velocity * velocity;
}

export function dragAcceleration({ cd, area, velocity, airDensity, mass }) {
	return dragForce({ cd, area, velocity, airDensity }) / mass;
}

export function netForce({ cd, area, velocity, airDensity, weight }) {
	return weight - dragForce({ cd, area, velocity, airDensity });
}
export function netAcceleration({ cd, area, velocity, airDensity, weight, mass }) {
	return netForce({ cd, area, velocity, airDensity, weight }) / mass;
}

export function steeringForce({ steerInput, canopyDeploy, steerForce, speed, maxSpeed = 8 }) {
	const steerEffectiveness = Math.min(1, speed / maxSpeed);
	return (steerInput * steerForce) * canopyDeploy * steerEffectiveness;
}

export function steeringAcceleration({ steerInput, canopyDeploy, steerForce, mass, speed, maxSpeed = 8 }) {
	return steeringForce({ steerInput, canopyDeploy, steerForce, speed, maxSpeed }) / mass;
}

export const PHYS_DEFAULTS = {
	gravity: -9.81, // m/s^2 (negative for downward acceleration)
	k: 1.0,        // Drag coefficient (default, can be changed)
	rohParachute: 1.15, // Default parachute density (kg/m^3)
	mass: 80,      // Player mass (kg)
	GRAVITY_Y: -9.81, // Alternative gravity constant for compatibility
	RHO0: 1.225,   // Air density at sea level (kg/m^3)
	SCALE_HEIGHT: 8500, // Atmospheric scale height (m)
	Cd_body: 0.9,  // Body drag coefficient
	Area_body: 0.7, // Body frontal area (m^2)
	Cd_canopy: 1.6, // Canopy drag coefficient
	Area_canopy: 40, // Canopy area (m^2)
	Steer_force_N: 30, // Steering force (N)
	Dive_gain: 11.0, // Dive coefficient
	Flare_gain: 9.0, // Flare coefficient
	Open_rate: 1.8, // Parachute open rate
	Close_rate: 3.0, // Parachute close rate
	autoOpen: true, // Auto-open parachute
	autoOpenAltitude: 120, // Auto-open altitude (m)
	canopyClearanceY: 2.6, // Canopy clearance (m)
	ropeThickness: 0.09, // Rope thickness (m)
	ropeCount: 16, // Number of ropes
	canopyRadius: 9.2, // Canopy radius (m)
	playerScale: 1.8, // Player scale
	windMode: 'dynamic', // Wind mode
	steadyWindX: 3, // Steady wind X component
	steadyWindZ: 1, // Steady wind Z component
};

export const phys = {};


