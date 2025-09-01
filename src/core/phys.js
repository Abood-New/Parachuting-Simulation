// Calculate parachute area (m^2)
export function swatheParachute({ shapeOfParachute, radius, parachuteTall, parachuteWidth }) {
	if (shapeOfParachute === false) {
		return (Math.PI * radius * radius) / 10000;
	} else if (shapeOfParachute === true) {
		return (parachuteTall * parachuteWidth) / 10000;
	} else return 0;
}

// Calculate parachute volume (m^3)
export function volumeParachute({ shapeOfParachute, radius, R, parachuteTall, parachuteWidth, thik }) {
	if (shapeOfParachute === false) {
		return ((2 / 3) * Math.PI * ((radius ** 3) - (R ** 3))) / 1000000;
	} else if (shapeOfParachute === true) {
		return (parachuteTall * parachuteWidth * thik) / 1000000;
	} else return 0;
}

// Calculate parachute mass (kg)
export function mParachute(roh, volume) {
	return roh * volume;
}

// Calculate air resistance (drag force, N)
// Updated to use proper air density instead of hardcoded 1
export function dragForce({ cd, area, velocity, airDensity }) {
	return 0.5 * airDensity * cd * area * velocity * velocity;
}

// Calculate drag acceleration (m/s^2) - force divided by mass
export function dragAcceleration({ cd, area, velocity, airDensity, mass }) {
	return dragForce({ cd, area, velocity, airDensity }) / mass;
}

// Net force (N)
// Updated to work with new dragForce function signature
export function netForce({ cd, area, velocity, airDensity, weight }) {
	return weight - dragForce({ cd, area, velocity, airDensity });
}

// Net acceleration (m/s^2) - net force divided by mass
export function netAcceleration({ cd, area, velocity, airDensity, weight, mass }) {
	return netForce({ cd, area, velocity, airDensity, weight }) / mass;
}

// Calculate lift force (N) based on sink rate and parachute deployment
export function liftForce({ sinkRate, canopyDeploy, liftGain, angleOfAttack = 0 }) {
	const liftEfficiency = 1 - angleOfAttack * 0.3;
	return liftGain * sinkRate * canopyDeploy * liftEfficiency;
}

// Calculate lift acceleration (m/s^2)
export function liftAcceleration({ sinkRate, canopyDeploy, liftGain, mass, angleOfAttack = 0 }) {
	return liftForce({ sinkRate, canopyDeploy, liftGain, angleOfAttack }) / mass;
}

// Calculate glide force (N) for horizontal movement
export function glideForce({ sinkRate, canopyDeploy, glideGain, angleOfAttack = 0 }) {
	const glideEfficiency = Math.max(0.3, 1 - angleOfAttack);
	return glideGain * sinkRate * canopyDeploy * glideEfficiency;
}

// Calculate glide acceleration (m/s^2)
export function glideAcceleration({ sinkRate, canopyDeploy, glideGain, mass, angleOfAttack = 0 }) {
	return glideForce({ sinkRate, canopyDeploy, glideGain, angleOfAttack }) / mass;
}

// Calculate steering force (N)
export function steeringForce({ steerInput, canopyDeploy, steerForce, speed, maxSpeed = 8 }) {
	const steerEffectiveness = Math.min(1, speed / maxSpeed);
	return (steerInput * steerForce) * canopyDeploy * steerEffectiveness;
}

// Calculate steering acceleration (m/s^2)
export function steeringAcceleration({ steerInput, canopyDeploy, steerForce, mass, speed, maxSpeed = 8 }) {
	return steeringForce({ steerInput, canopyDeploy, steerForce, speed, maxSpeed }) / mass;
}

// Velocity after landing (m/s)
export function vAfterLand(v0, t0, g = 9.81) {
	return v0 - (0.6 * g * t0);
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
	Lift_gain: 1.05, // Lift coefficient
	Glide_gain: 0.35, // Glide coefficient
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


