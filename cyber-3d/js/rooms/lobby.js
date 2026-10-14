// ============================================
// CYBER::TOWER — Lobby Room
// Tutorial space, hologram, elevator entrance
// ============================================

import * as THREE from 'three';
import { Room } from './Room.js';
import { COLORS, CSS_COLORS, ROOM_SIZE, ROOM_HEIGHT, FLOORS } from '../constants.js';
import { showNotification } from '../hud.js';
import { state } from '../state.js';
import { createElevatorPanel } from '../elevator.js';

export class LobbyRoom extends Room {
    constructor() {
        super('lobby', FLOORS.lobby.index);
    }

    build() {
        const { wallMat } = this.buildShell(COLORS.neonBlue);

        this._buildHologram();
        this._buildColumns();
        this._buildElevatorDoors(wallMat);
        this._buildSignage();
        this._buildTerminals();
        this._buildDecoLights();
        this._buildParticles();
        this._buildMovingPlatforms();
        this._buildDevButton();

        return this.group;
    }

    // ── Central Hologram ────────────────────────

    _buildHologram() {
        const holo = new THREE.Group();
        holo.position.set(0, 2.8, 0);

        // Outer wireframe icosahedron
        const icoGeo = new THREE.IcosahedronGeometry(1.6, 1);
        const icoMat = new THREE.MeshBasicMaterial({
            color: COLORS.neonBlue,
            wireframe: true,
            transparent: true,
            opacity: 0.25,
        });
        const ico = new THREE.Mesh(icoGeo, icoMat);
        holo.add(ico);

        // Inner glowing core
        const coreGeo = new THREE.OctahedronGeometry(0.5);
        const coreMat = new THREE.MeshStandardMaterial({
            color: 0x002233,
            emissive: COLORS.neonBlue,
            emissiveIntensity: 3,
            transparent: true,
            opacity: 0.85,
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        holo.add(core);

        // Orbiting ring 1
        const ring1 = this._makeRing(2.0, COLORS.neonGreen, 0.3);
        ring1.rotation.x = Math.PI / 3;
        holo.add(ring1);

        // Orbiting ring 2
        const ring2 = this._makeRing(1.4, COLORS.neonPink, 0.2);
        ring2.rotation.x = -Math.PI / 4;
        ring2.rotation.z = Math.PI / 5;
        holo.add(ring2);

        // Point light for the hologram
        const light = new THREE.PointLight(COLORS.neonBlue, 2.5, 14);
        light.position.set(0, 0, 0);
        holo.add(light);

        // Pedestal
        const pedGeo = new THREE.CylinderGeometry(0.8, 1.0, 0.3, 8);
        const pedMat = new THREE.MeshStandardMaterial({
            color: COLORS.darkPanel,
            emissive: COLORS.neonBlue,
            emissiveIntensity: 0.3,
            metalness: 0.6,
            roughness: 0.4,
        });
        const pedestal = new THREE.Mesh(pedGeo, pedMat);
        pedestal.position.set(0, -2.65, 0);
        holo.add(pedestal);

        this.group.add(holo);

        // Collider for pedestal
        this.colliders.push(new THREE.Box3(
            new THREE.Vector3(-1, this.floorY, -1),
            new THREE.Vector3(1, this.floorY + 0.5, 1)
        ));

        // Animate
        this.animatedObjects.push({
            update(delta) {
                ico.rotation.y += delta * 0.15;
                ico.rotation.x += delta * 0.08;
                core.rotation.y -= delta * 0.4;
                ring1.rotation.z += delta * 0.25;
                ring2.rotation.y += delta * 0.3;
                // Pulse core
                const t = performance.now() * 0.001;
                coreMat.emissiveIntensity = 2.5 + Math.sin(t * 1.5) * 1.0;
                icoMat.opacity = 0.2 + Math.sin(t * 0.8) * 0.1;
            }
        });
    }

    _makeRing(radius, color, opacity) {
        const geo = new THREE.TorusGeometry(radius, 0.025, 8, 64);
        const mat = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity,
        });
        return new THREE.Mesh(geo, mat);
    }

    // ── Columns ─────────────────────────────────

    _buildColumns() {
        const positions = [
            [-7, 5], [7, 5], [-7, -5], [7, -5],
        ];
        const colMat = new THREE.MeshStandardMaterial({
            color: 0x0f0f1e,
            roughness: 0.7,
            metalness: 0.3,
        });

        for (const [x, z] of positions) {
            const col = new THREE.Mesh(
                new THREE.CylinderGeometry(0.45, 0.45, ROOM_HEIGHT, 12),
                colMat
            );
            col.position.set(x, ROOM_HEIGHT / 2, z);
            this.group.add(col);

            // Neon ring at top and bottom
            this.addNeonStrip(x, 0.3, z, 0.06, 'y', COLORS.neonBlue, 1.5);
            const ringGeo = new THREE.TorusGeometry(0.5, 0.025, 8, 32);
            const ringMat = new THREE.MeshBasicMaterial({
                color: COLORS.neonBlue,
                transparent: true,
                opacity: 0.4,
            });
            const topRing = new THREE.Mesh(ringGeo, ringMat);
            topRing.position.set(x, ROOM_HEIGHT - 0.1, z);
            topRing.rotation.x = Math.PI / 2;
            this.group.add(topRing);

            // Collider
            this.colliders.push(new THREE.Box3(
                new THREE.Vector3(x - 0.5, this.floorY, z - 0.5),
                new THREE.Vector3(x + 0.5, this.floorY + ROOM_HEIGHT, z + 0.5)
            ));
        }
    }

    // ── Elevator Doors ──────────────────────────

    _buildElevatorDoors(wallMat) {
        const ey = 0;
        const ez = -ROOM_SIZE / 2 + 0.6;
        const doorW = 1.4;
        const doorH = 3.0;

        // Frame
        const frameMat = new THREE.MeshStandardMaterial({
            color: 0x0a0a18,
            emissive: COLORS.neonPink,
            emissiveIntensity: 0.15,
            metalness: 0.5,
            roughness: 0.5,
        });
        // Top frame
        this.addBox(0, doorH, ez, doorW * 2 + 0.6, 0.3, 0.4, frameMat, { collider: false });
        // Left frame
        this.addBox(-doorW - 0.15, 0, ez, 0.3, doorH, 0.4, frameMat, { collider: false });
        // Right frame
        this.addBox(doorW + 0.15, 0, ez, 0.3, doorH, 0.4, frameMat, { collider: false });

        // Door panels (will animate later)
        const doorMat = new THREE.MeshStandardMaterial({
            color: 0x0d0d20,
            emissive: COLORS.neonPink,
            emissiveIntensity: 0.05,
            metalness: 0.7,
            roughness: 0.4,
        });

        const leftDoor = this.addBox(-doorW / 2, 0, ez, doorW, doorH, 0.15, doorMat, { collider: false });
        const rightDoor = this.addBox(doorW / 2, 0, ez, doorW, doorH, 0.15, doorMat, { collider: false });

        // Store for elevator system
        this.elevatorDoors = { left: leftDoor, right: rightDoor, closedX: { l: -doorW / 2, r: doorW / 2 } };

        // Elevator collider (blocks passage through closed doors)
        this.elevatorCollider = new THREE.Box3(
            new THREE.Vector3(-doorW - 0.2, this.floorY, ez - 0.3),
            new THREE.Vector3(doorW + 0.2, this.floorY + doorH, ez + 0.3)
        );
        this.colliders.push(this.elevatorCollider);

        // Neon strip above doors
        this.addNeonStrip(0, doorH + 0.35, ez, doorW * 2, 'x', COLORS.neonPink, 2.5);

        // "AUFZUG" label
        this.addTextPlane('AUFZUG', 0, doorH + 0.8, ez + 0.1, 3, 0.5, {
            color: CSS_COLORS.neonPink,
            fontSize: 36,
        });

        // Elevator call panel (interactive — uses elevator system)
        const panel = createElevatorPanel(THREE, this,
            doorW + 0.5, 1.3, ez + 0.05,
            state.unlockedFloors
        );
        this.interactables.push(panel);
    }

    // ── Signs & Decoration ──────────────────────

    _buildSignage() {
        // Main title on south wall (north wall is occupied by elevator)
        this.addTextPlane('CYBER::TOWER', 0, 3.8, ROOM_SIZE / 2 - 0.6, 10, 1.2, {
            color: CSS_COLORS.neonBlue,
            fontSize: 56,
            rotY: Math.PI,
        });

        // Subtitle
        this.addTextPlane('DATENZENTRALE — EBENE 0', 0, 2.8, ROOM_SIZE / 2 - 0.6, 8, 0.5, {
            color: CSS_COLORS.dim,
            fontSize: 24,
            rotY: Math.PI,
        });

        // Side wall labels
        this.addTextPlane('> TERMINAL_01', -ROOM_SIZE / 2 + 0.6, 3, 7, 4, 0.4, {
            color: CSS_COLORS.neonGreen,
            fontSize: 22,
            fontFamily: 'Share Tech Mono',
            rotY: Math.PI / 2,
        });

        this.addTextPlane('> TERMINAL_02', ROOM_SIZE / 2 - 0.6, 3, 7, 4, 0.4, {
            color: CSS_COLORS.neonGreen,
            fontSize: 22,
            fontFamily: 'Share Tech Mono',
            rotY: -Math.PI / 2,
        });
    }

    // ── Interactive Terminals ───────────────────

    _buildTerminals() {
        const terminalData = [
            {
                pos: [-8, 0, 8],
                title: 'MISSION BRIEFING',
                text: `Willkommen, Agent.\n\nDu befindest dich im CYBER::TOWER — einem gesicherten Datenzentrum mit mehreren Ebenen.\n\nJede Ebene ist durch ein Sicherheits-Gate geschützt. Löse das Rätsel, um den Aufzug zur nächsten Ebene freizuschalten.\n\nAuf jeder Ebene sind 3 DATENFRAGMENTE versteckt. Finde alle 15, um den geheimen Raum auf dem Dach zu öffnen.\n\nViel Erfolg.`
            },
            {
                pos: [8, 0, 8],
                title: 'SYSTEM STATUS',
                text: `CYBER::TOWER v2.0\n\n◆ LOBBY ............ ONLINE\n◆ B1: HARDWARE ..... GESPERRT\n◆ F2: PIXEL ........ GESPERRT\n◆ F3: KRYPTO ....... GESPERRT\n◆ DACH ............. GESPERRT\n\nSicherheitsfreigabe: 0 / 4\nDatefragmente: 0 / 15`
            }
        ];

        for (const t of terminalData) {
            this._buildTerminalKiosk(t.pos[0], t.pos[1], t.pos[2], t.title, t.text);
        }
    }

    _buildTerminalKiosk(x, y, z, title, text) {
        const group = new THREE.Group();

        // Base pedestal
        const baseMat = new THREE.MeshStandardMaterial({
            color: 0x0c0c1a,
            metalness: 0.5,
            roughness: 0.5,
        });
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(0.4, 0.5, 0.8, 8),
            baseMat
        );
        base.position.set(x, 0.4, z);
        group.add(base);

        // Screen (angled)
        const screenMat = new THREE.MeshStandardMaterial({
            color: 0x001a2a,
            emissive: COLORS.neonGreen,
            emissiveIntensity: 0.4,
            metalness: 0.3,
            roughness: 0.5,
        });
        const screen = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.6, 0.05),
            screenMat
        );
        screen.position.set(x, 1.15, z);
        screen.rotation.x = -0.3;
        group.add(screen);

        // Glow
        const glow = new THREE.PointLight(COLORS.neonGreen, 0.5, 5);
        glow.position.set(x, 1.3, z + 0.3);
        group.add(glow);

        this.group.add(group);

        // Collider
        this.colliders.push(new THREE.Box3(
            new THREE.Vector3(x - 0.6, this.floorY, z - 0.6),
            new THREE.Vector3(x + 0.6, this.floorY + 1.5, z + 0.6)
        ));

        // Interactable — opens terminal overlay
        this.interactables.push({
            mesh: group,
            onInteract: () => {
                this._openTerminal(title, text);
            }
        });
    }

    _openTerminal(title, body) {
        const content = document.getElementById('terminal-content');
        const overlay = document.getElementById('terminal-overlay');
        content.innerHTML = `<h2>${title}</h2><p style="white-space:pre-line">${body}</p>`;
        overlay.classList.remove('hidden');
        state.terminalOpen = true;
        state.emit('openTerminal');
    }

    // ── Atmospheric Lights ──────────────────────

    _buildDecoLights() {
        // Central hologram light (already added in hologram)

        // Ceiling light strips
        this.addNeonStrip(-5, ROOM_HEIGHT - 0.1, 0, ROOM_SIZE - 4, 'z', COLORS.neonBlue, 0.8);
        this.addNeonStrip(5, ROOM_HEIGHT - 0.1, 0, ROOM_SIZE - 4, 'z', COLORS.neonBlue, 0.8);

        // Corner accent lights
        const corners = [
            [-13, 0.5, -13], [13, 0.5, -13],
            [-13, 0.5, 13],  [13, 0.5, 13],
        ];
        for (const [cx, cy, cz] of corners) {
            this.addLight(cx, cy + 2, cz, COLORS.neonBlue, 0.6, 8);
        }

        // Pink accent near elevator
        this.addLight(0, 3, -ROOM_SIZE / 2 + 2, COLORS.neonPink, 1.0, 8);
    }

    // ── Floating Particles ──────────────────────

    _buildParticles() {
        const count = 200;
        const positions = new Float32Array(count * 3);
        const S = ROOM_SIZE / 2 - 1;

        for (let i = 0; i < count; i++) {
            positions[i * 3]     = (Math.random() - 0.5) * S * 2;
            positions[i * 3 + 1] = Math.random() * ROOM_HEIGHT;
            positions[i * 3 + 2] = (Math.random() - 0.5) * S * 2;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.PointsMaterial({
            color: COLORS.neonBlue,
            size: 0.04,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        const points = new THREE.Points(geo, mat);
        this.group.add(points);

        // Slow upward drift
        this.animatedObjects.push({
            update(delta) {
                const pos = geo.attributes.position.array;
                for (let i = 1; i < pos.length; i += 3) {
                    pos[i] += delta * 0.08;
                    if (pos[i] > ROOM_HEIGHT) pos[i] = 0;
                }
                geo.attributes.position.needsUpdate = true;
            }
        });
    }
    // ── Moving Platforms ─────────────────────────

    _buildMovingPlatforms() {
        // Platform 1: slides east↔west near the hologram
        this.addMovingPlatform(-5, 1.2, -2, 2.5, 0.22, 1.2, 'x', 4.5, 0.7);
        // Platform 2: slides north↔south on the opposite side
        this.addMovingPlatform( 5, 2.0,  3, 2.2, 0.22, 1.2, 'z', 4.0, 0.9);
    }

    // ── Dev Unlock Button (🔒 Passwort: 1337) ────────

    _buildDevButton() {
        const btn = document.createElement('button');
        btn.textContent = '🔓';
        btn.title = 'DEV: Alles freischalten';
        btn.style.cssText = `
            position: fixed; bottom: 12px; left: 12px;
            width: 28px; height: 28px;
            background: rgba(10,10,20,0.7);
            border: 1px solid rgba(0,212,255,0.25);
            color: rgba(0,212,255,0.4); font-size: 14px;
            cursor: pointer; border-radius: 4px;
            z-index: 9000; padding: 0; line-height: 1;
            transition: border-color 0.2s, color 0.2s;
        `;
        btn.addEventListener('mouseenter', () => {
            btn.style.borderColor = 'rgba(0,212,255,0.7)';
            btn.style.color = 'rgba(0,212,255,0.9)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.borderColor = 'rgba(0,212,255,0.25)';
            btn.style.color = 'rgba(0,212,255,0.4)';
        });
        btn.addEventListener('click', () => {
            const pw = prompt('🔒 DEV-Passwort:');
            if (pw !== '1337') { if (pw !== null) alert('Falsches Passwort.'); return; }

            const { state, rooms, fireworks } = window._cyberTower;

            // Unlock all floors
            ['keller', 'pixel', 'krypto', 'dach'].forEach(id => state.unlockFloor(id));

            // Solve all puzzles
            ['keller', 'pixel', 'krypto'].forEach(id => state.solvePuzzle(id));

            // Fill all 15 fragments
            ['lobby', 'keller', 'pixel', 'krypto', 'dach'].forEach(rid => {
                for (let i = 0; i < 3; i++) {
                    state.fragments.collected.add(`${rid}-${i}`);
                }
            });
            // Fire event so dach.js opens secret door
            state.emit('fragmentCollected', {
                count: state.fragments.collected.size,
                total: state.fragments.total,
            });

            // Open secret door directly as well
            if (rooms?.dach && !rooms.dach.secretOpen) {
                rooms.dach._openSecretDoor?.();
            }

            // Activate weapon + start fireworks for fun
            window._cyberTower?.weapon?.activate();
            if (fireworks) { fireworks.setOrigin(0, 0, 0); fireworks.launch(5); }

            import('../hud.js').then(({ showNotification }) => {
                showNotification('🔓 DEV: Alle Ebenen & Geheimraum freigeschaltet!');
            });

            btn.textContent = '✓';
            btn.style.opacity = '0.35';
            btn.title = 'DEV: bereits freigeschaltet';
        });
        document.body.appendChild(btn);
    }

    // ── Spawn ───────────────────────────────────

    getSpawnPoint() {
        return new THREE.Vector3(0, this.floorY + 1.7, 10);
    }
}
