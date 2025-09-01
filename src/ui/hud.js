import { airDensityAt } from '../systems/wind.js';
import { state } from '../core/state.js';
import { PHYS_DEFAULTS } from '../core/phys.js';

let hudEl;
export function initHUD() {
	hudEl = document.createElement('div');
	hudEl.style.position = 'fixed';
	hudEl.style.left = '12px';
	hudEl.style.top = '12px';
	hudEl.style.background = 'rgba(0,0,0,0.55)';
	hudEl.style.color = '#fff';
	hudEl.style.padding = '10px';
	hudEl.style.borderRadius = '8px';
	hudEl.style.fontFamily = 'monospace';
	hudEl.style.zIndex = '9999';
	hudEl.style.lineHeight = '1.35';
	document.body.appendChild(hudEl);
}

export function updateHUD(windVec) {
	const speed = state.vel.length();
	const horizontalSpeed = Math.sqrt(state.vel.x * state.vel.x + state.vel.z * state.vel.z);
	const verticalSpeed = Math.abs(state.vel.y);
	const glideRatio = horizontalSpeed > 0.1 ? (horizontalSpeed / verticalSpeed).toFixed(1) : '∞';
	const timeToGround = state.pos.y / Math.max(0.1, Math.abs(state.vel.y));
	const landingDistance = Math.sqrt(Math.pow(state.vel.x * timeToGround, 2) + Math.pow(state.vel.z * timeToGround, 2));

	// Calculate forces using the SAME method as aero.js
	const gravityForce = PHYS_DEFAULTS.mass * Math.abs(PHYS_DEFAULTS.gravity); // Weight force (N)
	const rho = airDensityAt(state.pos.y);
	const areaEff = state.parachuteOpen ? PHYS_DEFAULTS.Area_canopy : PHYS_DEFAULTS.Area_body;
	const cdEff = state.parachuteOpen ? PHYS_DEFAULTS.Cd_canopy : PHYS_DEFAULTS.Cd_body;

	// Use the EXACT same drag calculation as aero.js
	const dragForceValue = 0.5 * rho * cdEff * areaEff * speed * speed;
	const netForceValue = gravityForce - dragForceValue;
	const acceleration = netForceValue / PHYS_DEFAULTS.mass;

	// Terminal velocity calculation using the same parameters
	const terminalVelocity = Math.sqrt((2 * gravityForce) / (rho * cdEff * areaEff));

	if (!hudEl) initHUD();
	let deathMsg = '';
	if (state.playerDead) {
		deathMsg = `<div style="\n            position: fixed;\n            left: 50vw;\n            top: 40vh;\n            transform: translate(-50%, -50%);\n            font-size: 3em;\n            color: #ff2222;\n            font-weight: bold;\n            text-shadow: 2px 2px 8px #000;\n            z-index: 10001;\n        ">💀 You Died! 💀<br><span style='font-size:0.5em;'>High speed impact</span></div>`;
	}
	hudEl.innerHTML = `
	${deathMsg}
	<div style="color: #00ff00;">السرعة الكلية: ${speed.toFixed(1)} m/s</div>
	<div style="color: #ffff00;">السرعة الأفقية: ${horizontalSpeed.toFixed(1)} m/s</div>
	<div style="color: #ff6600;">السرعة العمودية: ${verticalSpeed.toFixed(1)} m/s</div>
	<div style="color: #00ffff;">الارتفاع: ${state.pos.y.toFixed(1)} m</div>
	<div style="color: ${state.parachuteOpen ? '#00ff00' : '#ff0000'};">المظلة: ${state.parachuteOpen ? 'مفتوحة' : 'مغلقة'} (${Math.round(state.canopyDeploy * 100)}%)</div>
	<div style="color: #aaaaff;">الرياح: ${PHYS_DEFAULTS.windMode === 'steady' ? 'ثابتة' : 'ديناميكية'} [${windVec.x.toFixed(1)}, ${windVec.z.toFixed(1)}] m/s</div>
	<div style="color: #cccccc;">ρ(هواء): ${rho.toFixed(3)} kg/m³</div>
	<div style="color: #aaffaa;">سطح/أرض: ${state.onGround ? 'نعم' : 'لا'}</div>
	<div style="color: #aaccff;">التحكم: WASD للحركة، P للمظلة، J للقفز، R للإعادة، Q/E للتوجيه</div>
	
	<div style="border-top: 1px solid #666; margin-top: 8px; padding-top: 8px;">
		<div style="color: #ff4444; font-weight: bold;">=== القوى ===</div>
		<div style="color: #ff8888;">قوة الجاذبية: ${gravityForce.toFixed(1)} N</div>
		<div style="color: #88ff88;">قوة مقاومة الهواء: ${dragForceValue.toFixed(1)} N</div>
		<div style="color: ${netForceValue > 0 ? '#ffff88' : '#88ffff'}; font-weight: bold;">المحصلة: ${netForceValue.toFixed(1)} N</div>
		<div style="color: #ffaa88;">التسارع: ${acceleration.toFixed(2)} m/s²</div>
		<div style="color: #aa88ff;">السرعة النهائية: ${terminalVelocity.toFixed(1)} m/s</div>
		<div style="color: ${speed > terminalVelocity * 0.9 ? '#ff6666' : '#66ff66'}; font-weight: bold;">
			${speed > terminalVelocity * 0.9 ? '⚠️ قريب من السرعة النهائية' : '✅ سرعة آمنة'}
		</div>
		<div style="color: #ffcc88;">Cd: ${cdEff.toFixed(2)} | Area: ${areaEff.toFixed(2)} m²</div>
	</div>`;
}

//


