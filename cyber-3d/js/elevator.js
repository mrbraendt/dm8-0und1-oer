// ============================================
// CYBER::TOWER — Elevator System
// Handles floor transitions with animation
// ============================================

import { state } from './state.js';
import { showNotification } from './hud.js';
import { FLOORS, PLAYER_HEIGHT } from './constants.js';

let transitioning = false;
let overlay = null;
let controlsRef = null;

/**
 * Initialize the elevator system.
 * @param {Function} switchRoom - function(floorId) from main.js
 */
export function initElevator(switchRoom, controls) {
    overlay = document.getElementById('transition-overlay');
    controlsRef = controls;

    // Called from room interactables when the elevator panel is activated
    state.on('callElevator', async ({ fromFloor, toFloor }) => {
        if (transitioning) return;
        if (!state.unlockedFloors.has(toFloor)) {
            showNotification('ZUGANG VERWEIGERT — Sicherheitsfreigabe erforderlich.');
            return;
        }
        await transition(toFloor, switchRoom);
    });
}

/**
 * Perform elevator transition to a floor.
 */
async function transition(toFloor, switchRoom) {
    transitioning = true;
    state.paused = true;

    // Fade to black
    overlay.classList.remove('hidden');
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'auto';
    await animateOpacity(overlay, 0, 1, 500);

    // Show floor name
    const floorInfo = FLOORS[toFloor];
    overlay.innerHTML = `<div style="
        position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
        font-family:'Orbitron',sans-serif; font-size:1.8rem; font-weight:700;
        color:#00d4ff; text-shadow:0 0 20px rgba(0,212,255,0.5);
        letter-spacing:0.2em;
    ">${floorInfo ? floorInfo.name : toFloor.toUpperCase()}</div>`;

    await sleep(800);

    // Switch room
    switchRoom(toFloor);

    await sleep(400);

    // Fade from black
    overlay.innerHTML = '';
    await animateOpacity(overlay, 1, 0, 600);
    overlay.classList.add('hidden');
    overlay.style.pointerEvents = 'none';

    state.paused = false;
    transitioning = false;

    // Re-lock pointer after transition
    if (controlsRef) {
        controlsRef.lock();
    }
}

// ── Helpers ──

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function animateOpacity(el, from, to, duration) {
    return new Promise(resolve => {
        el.style.transition = `opacity ${duration}ms ease`;
        el.style.opacity = String(from);
        // Force reflow
        el.offsetHeight;
        el.style.opacity = String(to);
        setTimeout(resolve, duration + 50);
    });
}

/**
 * Create an elevator panel interactable for a room.
 * @param {number} rotY - Y rotation to face the panel inward (e.g. Math.PI for south wall)
 * Returns { mesh, onInteract } to push into room.interactables.
 */
export function createElevatorPanel(THREE, room, x, y, z, unlockedFloors, rotY = 0) {
    const panelGroup = new THREE.Group();

    // Back plate — brighter so it's clearly visible
    const baseMat = new THREE.MeshStandardMaterial({
        color: 0x111122,
        emissive: 0x223344,
        emissiveIntensity: 0.4,
        metalness: 0.5,
        roughness: 0.4,
    });
    const base = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 1.2, 0.08),
        baseMat
    );
    base.position.set(0, 0, 0);
    panelGroup.add(base);

    // Bright border frame
    const frameMat = new THREE.MeshStandardMaterial({
        color: 0x003344,
        emissive: 0x00aacc,
        emissiveIntensity: 1.2,
    });
    // Top/bottom strips
    const frameTop = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.04, 0.09), frameMat);
    frameTop.position.set(0, 0.6, 0);
    panelGroup.add(frameTop);
    const frameBot = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.04, 0.09), frameMat);
    frameBot.position.set(0, -0.6, 0);
    panelGroup.add(frameBot);
    // Side strips
    const frameL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.2, 0.09), frameMat);
    frameL.position.set(-0.3, 0, 0);
    panelGroup.add(frameL);
    const frameR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.2, 0.09), frameMat);
    frameR.position.set(0.3, 0, 0);
    panelGroup.add(frameR);

    // Floor buttons — bigger
    const floorKeys = Object.keys(FLOORS);
    const btnSize = 0.1;
    const spacing = 0.2;
    const startBtnY = -((floorKeys.length - 1) * spacing) / 2;

    for (let i = 0; i < floorKeys.length; i++) {
        const fId = floorKeys[i];
        const unlocked = unlockedFloors.has(fId);

        const btnGeo = new THREE.CylinderGeometry(btnSize, btnSize, 0.04, 12);
        const btnMat = new THREE.MeshStandardMaterial({
            color: unlocked ? 0x003322 : 0x110505,
            emissive: unlocked ? 0x00ff88 : 0x441111,
            emissiveIntensity: unlocked ? 2.0 : 0.4,
        });
        const btn = new THREE.Mesh(btnGeo, btnMat);
        btn.rotation.x = Math.PI / 2;
        btn.position.set(0, startBtnY + i * spacing, 0.05);
        panelGroup.add(btn);
    }

    panelGroup.position.set(x, y, z);
    if (rotY) panelGroup.rotation.y = rotY;
    room.group.add(panelGroup);

    return {
        mesh: panelGroup,
        onInteract: () => {
            // Open floor selection terminal
            openFloorSelect(room.id);
        }
    };
}

function openFloorSelect(currentFloor) {
    const content = document.getElementById('terminal-content');
    const overlay = document.getElementById('terminal-overlay');

    const floorKeys = Object.keys(FLOORS);
    let html = '<h2>AUFZUG — STOCKWERK WÄHLEN</h2>';

    for (const fId of floorKeys) {
        const f = FLOORS[fId];
        const unlocked = state.unlockedFloors.has(fId);
        const current = fId === currentFloor;
        const color = unlocked ? '#00ff88' : '#553333';
        const cursor = unlocked && !current ? 'pointer' : 'default';
        const label = current ? `${f.name} ◄ HIER` : f.name;
        const status = unlocked ? '◆ ONLINE' : '◇ GESPERRT';

        html += `<div style="
            display:flex; justify-content:space-between; align-items:center;
            padding:0.6rem 1rem; margin:0.3rem 0;
            border:1px solid ${color}33; background:${color}08;
            cursor:${cursor};
            ${unlocked && !current ? 'transition:background 0.2s;' : ''}
        " ${unlocked && !current ? `class="elevator-floor-btn" data-floor="${fId}"` : ''}>
            <span style="color:${color}; font-family:'Orbitron',sans-serif; font-size:0.85rem;">${label}</span>
            <span style="color:${color}88; font-size:0.75rem;">${status}</span>
        </div>`;
    }

    content.innerHTML = html;
    overlay.classList.remove('hidden');
    state.terminalOpen = true;
    state.emit('openTerminal');

    // Attach click handlers
    setTimeout(() => {
        content.querySelectorAll('.elevator-floor-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const toFloor = btn.dataset.floor;
                document.getElementById('terminal-overlay').classList.add('hidden');
                state.terminalOpen = false;
                state.emit('callElevator', { fromFloor: currentFloor, toFloor });
            });
            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'rgba(0,255,136,0.1)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'rgba(0,255,136,0.03)';
            });
        });
    }, 50);
}
