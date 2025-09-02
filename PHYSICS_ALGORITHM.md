# Physics Algorithm Explanation - Parachuting Simulation

## Overview

This parachuting simulation implements a realistic physics engine that models the complex aerodynamics of human body flight and parachute deployment. The system combines classical mechanics with specialized aerodynamic calculations to create an authentic skydiving experience.

## Core Physics Framework

### 1. Numerical Integration

The simulation uses **Euler's Method** for numerical integration with a fixed timestep approach:

```javascript
// Position integration: x(t+dt) = x(t) + v(t) * dt
state.pos.addScaledVector(state.vel, dt);

// Velocity integration: v(t+dt) = v(t) + a(t) * dt
state.vel.addScaledVector(state.acc, dt);
```

**Timestep Management:**
- Maximum timestep clamped to 60ms (0.06s) to maintain stability
- Adaptive timestep based on performance.now() for smooth animation
- Prevents physics instabilities during frame rate drops

### 2. Force System Architecture

The physics system follows Newton's second law (F = ma) with multiple force components:

```
Total Acceleration = Gravity + Drag + Lift + Glide + Steering + Wind + User Input
```

## Atmospheric Physics

### Air Density Model

The simulation implements realistic atmospheric density variation with altitude:

```javascript
ρ(h) = ρ₀ × e^(-h/H)
```

Where:
- **ρ₀ = 1.225 kg/m³** (sea level density)
- **H = 8500m** (atmospheric scale height)
- **h** = current altitude

This exponential decay model accurately represents how air becomes thinner with increasing altitude, directly affecting drag forces.

### Wind System

**Dynamic Wind Model:**
```javascript
windX = sin(t × 0.4) × 3 + cos(t × 0.13) × 1.2
windZ = cos(t × 0.3) × 1.5
```

- Combines multiple sinusoidal components for realistic wind variation
- Creates turbulent, non-uniform wind patterns
- Includes turbulence effects that scale with velocity and parachute deployment

## Aerodynamic Forces

### 1. Drag Force

The simulation uses the standard quadratic drag equation:

```javascript
F_drag = ½ × ρ × C_d × A × v²
```

**Parameters:**
- **Body Configuration:**
  - C_d = 0.9 (body drag coefficient)
  - A = 0.7 m² (frontal area)
- **Parachute Configuration:**
  - C_d = 1.6 (canopy drag coefficient)  
  - A = 40 m² (canopy area)

**Dynamic Interpolation:**
The system smoothly transitions between body and parachute configurations:
```javascript
C_d_effective = lerp(C_d_body, C_d_canopy, deploymentRatio)
A_effective = lerp(A_body, A_canopy, deploymentRatio)
```

### 2. Lift Force

Parachutes generate lift through the interaction of airflow with the canopy:

```javascript
F_lift = liftGain × sinkRate × deploymentRatio × liftEfficiency
```

**Key Components:**
- **Lift Gain:** 1.05 (tuned coefficient)
- **Sink Rate:** Vertical descent velocity component
- **Angle of Attack Effect:** `liftEfficiency = 1 - angleOfAttack × 0.3`

### 3. Glide Force

Horizontal gliding capability is modeled separately:

```javascript
F_glide = glideGain × sinkRate × deploymentRatio × glideEfficiency
```

- **Glide Gain:** 0.35
- **Glide Efficiency:** `max(0.3, 1 - angleOfAttack)`
- Applied in the horizontal direction opposite to relative velocity

### 4. Steering Forces

Parachute steering is implemented through asymmetric brake inputs:

```javascript
F_steering = steerInput × steerForce × deploymentRatio × effectiveness
```

**Steering Characteristics:**
- **Maximum Force:** 30N
- **Speed Dependency:** `effectiveness = min(1, speed/maxSpeed)`
- **Binary Input:** Left/right steering via Q/E keys
- **Roll Animation:** Visual banking effect during turns

## Parachute Deployment Physics

### Deployment Dynamics

The parachute deployment is modeled as a smooth transition rather than instantaneous:

```javascript
deploymentRate = (target > current) ? openRate : closeRate
deployment = clamp(deployment + sign(target - current) × rate × dt, 0, 1)
```

**Deployment Parameters:**
- **Open Rate:** 1.8 s⁻¹
- **Close Rate:** 3.0 s⁻¹
- **Auto-deployment:** Triggered at 120m altitude

### Canopy Geometry

The simulation supports multiple parachute geometries:

**Circular Parachute:**
```javascript
Area = π × r² / 10000  // Convert to m²
Volume = (2/3) × π × (r³ - R³) / 1000000  // m³
```

**Rectangular Parachute:**
```javascript
Area = length × width / 10000
Volume = length × width × thickness / 1000000
```

## Advanced Physics Features

### 1. Turbulence Modeling

Atmospheric turbulence is simulated through:
- **Drag Coefficient Modulation:** `C_d × (1 + sin(2t) × 0.05)`
- **Random Force Components:** Applied proportional to velocity and deployment
- **Visual Wind Particles:** 450 animated particles showing wind flow

### 2. Ground Interaction

**Landing Physics:**
- **Impact Velocity Check:** Death threshold at 18 m/s without parachute
- **Bounce Coefficient:** 0.2 (20% velocity retention on bounce)
- **Surface Friction:** Horizontal velocity damping (0.7 factor)

**Building Collision:**
- **Roof Landing:** Magnetic attraction to building centers
- **Penetration Resolution:** Push-out algorithm for building intersections
- **Velocity Damping:** Different coefficients for different surfaces

### 3. Mass and Inertia

**System Mass Components:**
- **Player Mass:** 80 kg (configurable)
- **Parachute Mass:** Calculated from material density and volume
- **Total System Mass:** Used in all force-to-acceleration calculations

## Control Integration

### User Input Processing

The system translates user inputs into aerodynamic forces:

**Movement Controls:**
- **WASD:** Horizontal movement desires
- **Shift:** Speed modifier (walk/run)
- **Q/E:** Parachute steering
- **Z:** Flare (upward force)
- **Arrow Down:** Dive (downward force)

**Force Application:**
```javascript
horizontalForce = (desired - current) × responsiveness
verticalManeuvers = (flare - dive) × deploymentRatio
```

## Performance Optimizations

### 1. Computational Efficiency

- **Vector Operations:** Optimized using Three.js vector methods
- **Conditional Physics:** Different physics modes for vehicle vs. free flight
- **Clamped Calculations:** Preventing division by zero and infinity

### 2. Stability Measures

- **Velocity Limiting:** Maximum horizontal speeds enforced
- **Position Validation:** NaN/Infinity detection and reset
- **Ground Clamping:** Prevents falling through terrain

## Mathematical Accuracy

The simulation achieves realistic behavior through:

1. **Physically Accurate Constants:** Based on real-world values
2. **Proper Unit Conversions:** Consistent SI units throughout
3. **Realistic Coefficients:** Drag and lift values match real parachutes
4. **Atmospheric Modeling:** Exponential density decay with altitude

## Conclusion

This physics engine provides a sophisticated simulation of parachuting dynamics by combining:
- Classical Newtonian mechanics
- Realistic atmospheric modeling  
- Complex aerodynamic interactions
- Smooth deployment transitions
- User-responsive controls

The result is an authentic parachuting experience that accurately represents the physics of human flight, from initial freefall through parachute deployment and landing.

## Technical Implementation Notes

**File Structure:**
- `src/core/phys.js` - Core physics calculations and constants
- `src/systems/aero.js` - Aerodynamics integration and force application
- `src/systems/wind.js` - Atmospheric and wind modeling
- `src/systems/collision.js` - Ground and building collision detection
- `src/main.js` - Main simulation loop and numerical integration

The modular architecture allows for easy modification and extension of individual physics components while maintaining system stability and performance.
