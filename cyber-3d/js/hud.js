// ============================================
// CYBER::TOWER — HUD Updates
// ============================================

import { FLOORS } from './constants.js';

const floorEl     = document.getElementById('hud-floor');
const fragmentsEl = document.getElementById('hud-fragments');
const notifEl     = document.getElementById('notification');

let notifTimer = null;

export function initHUD(state) {
    state.on('floorChanged', (id) => {
        const f = FLOORS[id];
        if (f) {
            floorEl.textContent = f.name;
            floorEl.style.color = '#' + f.color.toString(16).padStart(6, '0');
        }
    });

    state.on('fragmentCollected', ({ count, total }) => {
        fragmentsEl.textContent = `FRAGMENTE: ${count} / ${total}`;
        showNotification(`DATENFRAGMENT ERHALTEN (${count}/${total})`);
    });

    state.on('puzzleSolved', (id) => {
        showNotification(`SICHERHEITSEBENE DURCHBROCHEN — ${id.toUpperCase()}`);
    });

    state.on('floorUnlocked', (id) => {
        const f = FLOORS[id];
        if (f) showNotification(`NEUES STOCKWERK FREIGESCHALTET: ${f.name}`);
    });
}

export function showNotification(text, duration = 3000) {
    notifEl.textContent = text;
    notifEl.classList.remove('hidden');
    notifEl.classList.add('visible');

    clearTimeout(notifTimer);
    notifTimer = setTimeout(() => {
        notifEl.classList.remove('visible');
        setTimeout(() => notifEl.classList.add('hidden'), 400);
    }, duration);
}
