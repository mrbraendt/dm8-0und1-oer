// ============================================
// CYBER::TOWER — Main Entry Point
// ============================================

import * as THREE from 'three';
import { initScene } from './scene.js';
import { GameControls } from './controls.js';
import { Physics } from './physics.js';
import { InteractionSystem } from './interaction.js';
import { state } from './state.js';
import { initHUD, showNotification } from './hud.js';
import { PLAYER_HEIGHT } from './constants.js';
import { initElevator } from './elevator.js';
import { buildFragments } from './fragments.js';
import { startDrone, resumeAudio, playUnlock, playCollect } from './audio.js';
import { Ball } from './ball.js';
import { Fireworks } from './fireworks.js';
import { Hoverboard } from './hoverboard.js';
import { WeaponSystem } from './weapon.js';

// ── Room imports (add new rooms here) ──
import { LobbyRoom } from './rooms/lobby.js';
import { KellerRoom } from './rooms/keller.js';
import { PixelRoom }  from './rooms/pixel.js';
import { KryptoRoom } from './rooms/krypto.js';
import { DachRoom }   from './rooms/dach.js';

// Room registry — extend by adding entries
const ROOM_CLASSES = {
    lobby:  LobbyRoom,
    keller: KellerRoom,
    pixel:  PixelRoom,
    krypto: KryptoRoom,
    dach:   DachRoom,
};

// ── Global references ──
let scene, camera, renderer, composer;
let controls, physics, interaction;
let ball, fireworks, hoverboard, weapon;
let rooms = {};        // built Room instances
let activeRoom = null; // current Room
const clock = new THREE.Clock();
const heldKeys = {};   // live keyboard state for hoverboard
let devOCheatCount = 0;
let devOLastPressTs = 0;

function unlockEverythingForTesting({ activateWeapon = true } = {}) {
    ['keller', 'pixel', 'krypto', 'dach'].forEach(id => state.unlockFloor(id));
    ['keller', 'pixel', 'krypto'].forEach(id => state.solvePuzzle(id));

    ['lobby', 'keller', 'pixel', 'krypto', 'dach'].forEach(rid => {
        for (let i = 0; i < 3; i++) state.fragments.collected.add(`${rid}-${i}`);
    });

    state.emit('fragmentCollected', {
        count: state.fragments.collected.size,
        total: state.fragments.total,
    });

    if (rooms.dach && !rooms.dach.secretOpen) rooms.dach._openSecretDoor?.();

    if (activateWeapon) {
        weapon.activate();
        fireworks.setOrigin(0, 0, 0);
        fireworks.launch(4);
    }
}

// ── Init ──

async function init() {
    // Wait for fonts
    await document.fonts.ready;

    // Scene setup
    ({ scene, camera, renderer, composer } = initScene());

    // Systems
    controls = new GameControls(camera, renderer, state);
    physics = new Physics(camera);
    interaction = new InteractionSystem(camera, state);

    // HUD
    initHUD(state);

    // Ball
    ball = new Ball(scene);

    // New systems
    fireworks = new Fireworks(scene);
    weapon    = new WeaponSystem(scene);
    hoverboard = new Hoverboard(scene);

    // Build all rooms + fragments
    for (const [id, RoomClass] of Object.entries(ROOM_CLASSES)) {
        const room = new RoomClass();
        room.build();
        buildFragments(room);
        scene.add(room.group);
        rooms[id] = room;
    }

    // Elevator system
    initElevator(switchRoom, controls);

    // Place hoverboard on the dach
    hoverboard.place(-8, rooms.dach.floorY + 0.35, 2);

    // Expose all systems to globally (for dach.js callbacks)
    window._cyberTower.fireworks  = fireworks;
    window._cyberTower.hoverboard = hoverboard;
    window._cyberTower.weapon     = weapon;

    // Activate lobby
    switchRoom('lobby');

    // ── URL param: ?unlock=1337 → alle Etagen frei, aber kein Drohnen-Chaos ──
    if (new URLSearchParams(location.search).get('unlock') === '1337') {
        unlockEverythingForTesting({ activateWeapon: false });
        // Waffe/Drohnen bewusst nicht automatisch aktivieren
        fireworks.setOrigin(0, 0, 0);
        fireworks.launch(3);
        showNotification('🔓 Alle Etagen freigeschaltet — viel Spaß!');
    }

    // Jump + ball + hoverboard key handlers
    document.addEventListener('keydown', (e) => {
        heldKeys[e.code] = true;

        if (!e.repeat && e.code === 'KeyO' && !state.terminalOpen) {
            const now = performance.now();
            if (now - devOLastPressTs > 2200) devOCheatCount = 0;
            devOLastPressTs = now;
            devOCheatCount++;

            if (devOCheatCount >= 5) {
                devOCheatCount = 0;
                unlockEverythingForTesting({ activateWeapon: true });
                showNotification('🛠️ DEV-CHEAT: Alle Stockwerke + Waffe freigeschaltet');
            } else {
                showNotification(`🛠️ DEV-CHEAT: O ${devOCheatCount}/5`);
            }
        }

        if (state.paused || state.terminalOpen) return;
        if (e.code === 'Space' && !hoverboard.mounted) {
            physics.jump();
        }
        if (e.code === 'KeyF') {
            ball.toggle(camera);
        }
        // Dismount hoverboard with E
        if (e.code === 'KeyE' && hoverboard.mounted) {
            const dismounted = hoverboard.dismount(camera);
            if (dismounted) physics.velocityY = 0;
        }
    });
    document.addEventListener('keyup', (e) => { heldKeys[e.code] = false; });
    // Weapon fire
    document.addEventListener('mousedown', (e) => {
        if (e.button === 0 && weapon.active && !state.terminalOpen && !state.paused) {
            weapon.tryFire(camera);
        }
    });
    state.on('jump', () => {
        if (!state.paused && !state.terminalOpen && !hoverboard.mounted) physics.jump();
    });
    state.on('throwBall', () => {
        if (!state.paused && !state.terminalOpen) ball.toggle(camera);
    });

    // Terminal close button
    document.getElementById('terminal-close').addEventListener('click', () => {
        document.getElementById('terminal-overlay').classList.add('hidden');
        state.terminalOpen = false;
        if (controls.pointerLock) {
            controls.lock();
        }
    });

    // Also close terminal on ESC (delay terminalOpen reset to avoid race with pointer unlock)
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Escape' && state.terminalOpen) {
            document.getElementById('terminal-overlay').classList.add('hidden');
            // Delay so the pointer-unlock handler still sees terminalOpen=true
            requestAnimationFrame(() => {
                state.terminalOpen = false;
                // Re-lock pointer after terminal closes
                if (controls.pointerLock) {
                    controls.lock();
                }
            });
        }
    });

    // Listen for terminal open events from rooms
    state.on('openTerminal', () => {
        state.terminalOpen = true;
        if (controls.pointerLock && controls.pointerLock.isLocked) {
            controls.unlock();
        }
    });

    // Audio events
    state.on('puzzleSolved', () => playUnlock());
    state.on('fragmentCollected', () => playCollect());

    // Start audio on first interaction
    const startAudio = () => {
        resumeAudio();
        startDrone();
        document.removeEventListener('click', startAudio);
        document.removeEventListener('touchstart', startAudio);
    };
    document.addEventListener('click', startAudio);
    document.addEventListener('touchstart', startAudio);

    // Start render loop
    animate();
}

// ── Room Switching ──

function switchRoom(id) {
    const room = rooms[id];
    if (!room) return;

    activeRoom = room;
    state.setFloor(id);

    // Update physics
    physics.setColliders(room.colliders);
    physics.setGroundLevel(room.floorY);

    // Update ball physics
    ball.setColliders(room.colliders);
    ball.setGroundLevel(room.floorY);
    // Auto-catch ball on room switch
    if (ball.active) {
        ball.held = true;
        ball.active = false;
        ball.mesh.visible = false;
        ball.glitter.visible = false;
    }

    // Update interaction
    interaction.clear();
    for (const item of room.interactables) {
        interaction.register(item.mesh, item.onInteract);
    }

    // Move player to spawn
    const spawn = room.getSpawnPoint();
    camera.position.copy(spawn);
    physics.velocityY = 0;
}

// Expose for elevator system + new systems
window._cyberTower = { switchRoom, state, rooms, fireworks: null, hoverboard: null, weapon: null };

// ── Game Loop ──

function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.1);

    if (!state.paused && !state.terminalOpen) {
        const input = controls.getMovementInput();

        if (hoverboard.mounted) {
            hoverboard.update(delta, input, camera, heldKeys);
        } else {
            physics.update(input, delta);
            hoverboard.update(delta, { forward: 0, right: 0 }, camera, heldKeys); // bob idle
        }

        interaction.update();
        ball.update(delta);
    } else if (!hoverboard.mounted) {
        hoverboard.update(delta, { forward: 0, right: 0 }, camera, heldKeys); // bob even when paused
    }

    // Room animations + moving platforms (always run)
    if (activeRoom) {
        activeRoom.update(delta);
        activeRoom.updateMovingPlatforms(delta);
        physics.setMovingPlatforms(activeRoom.movingPlatforms);
    }

    // Fireworks + weapon always update (visual stays alive)
    fireworks.update(delta);
    weapon.update(delta, camera);

    // Sky ring detection (only on dach + hoverboard mounted)
    if (activeRoom?.id === 'dach' && hoverboard.mounted) {
        activeRoom.checkRings?.(camera);
    }

    composer.render();
}

// ── Start ──

init().catch(err => {
    console.error('CYBER::TOWER init failed:', err);
    // Show error on screen for debugging
    const errDiv = document.createElement('div');
    errDiv.style.cssText = 'position:fixed;top:10px;left:10px;right:10px;background:#220000;color:#ff4444;font-family:monospace;padding:1rem;z-index:9999;white-space:pre-wrap;border:1px solid #ff4444;';
    errDiv.textContent = 'CYBER::TOWER INIT ERROR:\n' + err.message + '\n' + err.stack;
    document.body.appendChild(errDiv);
});
