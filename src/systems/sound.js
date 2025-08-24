import { THREE } from '../core/scene.js';
import { state } from '../core/state.js';

let parachuteAudio;
let audioCtx;

export function initAudio() {
	const listener = new THREE.AudioListener();
	state.camera.add(listener);
	parachuteAudio = new THREE.Audio(listener);
	if (!audioCtx) audioCtx = (new (window.AudioContext || window.webkitAudioContext)());
	parachuteAudio.setBuffer(makePopBuffer(audioCtx));
	parachuteAudio.setLoop(false);
	parachuteAudio.setVolume(0.9);
}

export function triggerParachuteOpenFX() {
	if (!parachuteAudio) return;
	if (parachuteAudio.isPlaying) parachuteAudio.stop();
	parachuteAudio.play();
}

function makePopBuffer(ctx, durationSec = 0.28, rate = 44100) {
	const len = Math.floor(rate * durationSec);
	const buffer = ctx.createBuffer(1, len, rate);
	const data = buffer.getChannelData(0);
	for (let i = 0; i < len; i++) {
		const t = i / len;
		const attack = Math.min(1, t / 0.05);
		const decay = Math.pow(1 - t, 1.6);
		const pop = (Math.random() * 2 - 1) * 0.5 + Math.sin(2 * Math.PI * 220 * t) * 0.15;
		data[i] = pop * attack * decay;
	}
	return buffer;
}


