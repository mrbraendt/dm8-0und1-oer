// ============================================
// CYBER::TOWER — Procedural Audio System
// All sounds generated via Web Audio API
// ============================================

let ctx = null;
let droneGain = null;
let droneNodes = [];
let started = false;

function getCtx() {
    if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctx;
}

// ── Ambient Drone ───────────────────────────

export function startDrone() {
    if (started) return;
    started = true;
    const c = getCtx();

    // Master gain
    droneGain = c.createGain();
    droneGain.gain.value = 0;
    droneGain.connect(c.destination);

    // Fade in
    droneGain.gain.linearRampToValueAtTime(0.12, c.currentTime + 3);

    // Layer 1: deep bass
    const osc1 = c.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.value = 45;
    const g1 = c.createGain();
    g1.gain.value = 0.3;

    // Low-pass filter
    const lpf = c.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 120;
    lpf.Q.value = 2;

    osc1.connect(g1).connect(lpf).connect(droneGain);
    osc1.start();
    droneNodes.push(osc1);

    // Layer 2: sub harmonic
    const osc2 = c.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 55;
    const g2 = c.createGain();
    g2.gain.value = 0.15;
    osc2.connect(g2).connect(droneGain);
    osc2.start();
    droneNodes.push(osc2);

    // Layer 3: high shimmer
    const osc3 = c.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.value = 880;
    const g3 = c.createGain();
    g3.gain.value = 0.015;
    osc3.connect(g3).connect(droneGain);
    osc3.start();
    droneNodes.push(osc3);

    // LFO on filter cutoff
    const lfo = c.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1;
    const lfoGain = c.createGain();
    lfoGain.gain.value = 40;
    lfo.connect(lfoGain).connect(lpf.frequency);
    lfo.start();
    droneNodes.push(lfo);
}

export function stopDrone() {
    if (!started) return;
    if (droneGain) {
        droneGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
    }
    setTimeout(() => {
        droneNodes.forEach(n => { try { n.stop(); } catch(e) {} });
        droneNodes = [];
        started = false;
    }, 1200);
}

// ── UI Sounds ───────────────────────────────

export function playClick() {
    const c = getCtx();
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 800;
    const gain = c.createGain();
    gain.gain.value = 0.1;
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);
    osc.connect(gain).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.1);
}

export function playUnlock() {
    const c = getCtx();
    const osc = c.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 400;
    osc.frequency.linearRampToValueAtTime(1200, c.currentTime + 0.4);
    const gain = c.createGain();
    gain.gain.value = 0.08;
    gain.gain.linearRampToValueAtTime(0.001, c.currentTime + 0.5);
    osc.connect(gain).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.5);
}

export function playCollect() {
    const c = getCtx();
    // Two-note chime
    [660, 880].forEach((freq, i) => {
        const osc = c.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const gain = c.createGain();
        gain.gain.value = 0.08;
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.1 * i + 0.3);
        osc.connect(gain).connect(c.destination);
        osc.start(c.currentTime + 0.1 * i);
        osc.stop(c.currentTime + 0.1 * i + 0.35);
    });
}

export function playError() {
    const c = getCtx();
    const osc = c.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 200;
    const gain = c.createGain();
    gain.gain.value = 0.06;
    gain.gain.linearRampToValueAtTime(0.001, c.currentTime + 0.2);
    osc.connect(gain).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.25);
}

// ── Resume on first interaction (required by browsers) ──

export function resumeAudio() {
    const c = getCtx();
    if (c.state === 'suspended') {
        c.resume();
    }
}
