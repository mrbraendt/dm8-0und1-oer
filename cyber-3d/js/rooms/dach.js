// ============================================
// CYBER::TOWER — Dach Room (Rooftop Finale)
// Completion screen, secret room for fragments
// Fireworks, hoverboard, sky rings, drone arena
// ============================================

import * as THREE from 'three';
import { Room } from './Room.js';
import { COLORS, CSS_COLORS, ROOM_SIZE, ROOM_HEIGHT, FLOORS } from '../constants.js';
import { state } from '../state.js';
import { showNotification } from '../hud.js';
import { createElevatorPanel } from '../elevator.js';

export class DachRoom extends Room {
    constructor() {
        super('dach', FLOORS.dach.index);
        this.secretDoor  = null;
        this.secretOpen  = false;
        this.skyRings    = []; // { mesh, pos, outerR } for fly-through detection
        this.ringsHit    = new Set();
    }

    build() {
        // No ceiling — open sky
        this._buildOpenRoof();
        this._buildSkyline();
        this._buildFinaleHologram();
        this._buildSecretRoom();
        this._buildFireworkPads();
        this._buildHoverboardSpawn();
        this._buildSkyRings();
        this._buildElevator();
        this._buildParticles();

        return this.group;
    }

    // ── Open Roof (special shell) ───────────────

    _buildOpenRoof() {
        const S = ROOM_SIZE;
        const HS = S / 2;
        const H = ROOM_HEIGHT;

        const wallMat = new THREE.MeshStandardMaterial({
            color: COLORS.darkPanel, roughness: 0.85, metalness: 0.15,
        });
        const floorMat = new THREE.MeshStandardMaterial({
            color: COLORS.darkFloor, roughness: 0.92,
        });

        // Floor
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(S, S), floorMat);
        floor.rotation.x = -Math.PI / 2;
        this.group.add(floor);

        // Low walls (railing height = 1.2)
        const railH = 1.2;
        this.addBox(0, 0, -HS, S, railH, 0.4, wallMat);
        this.addBox(0, 0, HS, S, railH, 0.4, wallMat);
        this.addBox(-HS, 0, 0, 0.4, railH, S, wallMat);
        this.addBox(HS, 0, 0, 0.4, railH, S, wallMat);

        // Neon top rails
        this.addNeonStrip(0, railH + 0.05, -HS, S - 1, 'x', COLORS.neonBlue);
        this.addNeonStrip(0, railH + 0.05, HS, S - 1, 'x', COLORS.neonBlue);
        this.addNeonStrip(-HS, railH + 0.05, 0, S - 1, 'z', COLORS.neonBlue);
        this.addNeonStrip(HS, railH + 0.05, 0, S - 1, 'z', COLORS.neonBlue);

        // Floor grid
        const grid = new THREE.GridHelper(S, S, COLORS.neonBlue, COLORS.neonBlue);
        grid.material.transparent = true;
        grid.material.opacity = 0.05;
        grid.position.y = 0.01;
        this.group.add(grid);

        // Title
        this.addTextPlane('DACH — ZIEL ERREICHT', 0, 3, -HS + 1, 10, 0.8, {
            color: CSS_COLORS.neonBlue,
            fontSize: 40,
        });
    }

    // ── Procedural Skyline ──────────────────────

    _buildSkyline() {
        const buildingMat = new THREE.MeshStandardMaterial({
            color: 0x060610,
            roughness: 0.9,
        });
        const windowMat = new THREE.MeshStandardMaterial({
            color: 0x001122,
            emissive: COLORS.neonBlue,
            emissiveIntensity: 0.6,
        });

        // Random buildings around the perimeter
        const rng = (min, max) => min + Math.random() * (max - min);
        const HS = ROOM_SIZE / 2;

        for (let i = 0; i < 40; i++) {
            const w = rng(2, 6);
            const h = rng(4, 18);
            const d = rng(2, 6);

            // Place around the edges
            let x, z;
            const side = Math.floor(Math.random() * 4);
            switch (side) {
                case 0: x = rng(-40, 40); z = -HS - rng(5, 30); break;
                case 1: x = rng(-40, 40); z = HS + rng(5, 30); break;
                case 2: x = -HS - rng(5, 30); z = rng(-40, 40); break;
                case 3: x = HS + rng(5, 30); z = rng(-40, 40); break;
            }

            const building = new THREE.Mesh(
                new THREE.BoxGeometry(w, h, d),
                buildingMat
            );
            building.position.set(x, h / 2, z);
            this.group.add(building);

            // Random lit windows
            const windowCount = Math.floor(rng(2, 8));
            for (let j = 0; j < windowCount; j++) {
                const ww = new THREE.Mesh(
                    new THREE.BoxGeometry(0.4, 0.4, 0.05),
                    windowMat
                );
                ww.position.set(
                    x + rng(-w/3, w/3),
                    rng(1, h - 1),
                    z + (side <= 1 ? (side === 0 ? d/2 + 0.05 : -d/2 - 0.05) : rng(-d/3, d/3))
                );
                this.group.add(ww);
            }
        }
    }

    // ── Finale Hologram ─────────────────────────

    _buildFinaleHologram() {
        const holo = new THREE.Group();
        holo.position.set(0, 2.5, 0);

        // Large wireframe sphere
        const sphereGeo = new THREE.IcosahedronGeometry(2, 2);
        const sphereMat = new THREE.MeshBasicMaterial({
            color: COLORS.neonBlue,
            wireframe: true,
            transparent: true,
            opacity: 0.15,
        });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        holo.add(sphere);

        // Glowing core with all 3 colors
        const colors = [COLORS.neonBlue, COLORS.neonGreen, COLORS.neonPink];
        const cores = [];
        for (let i = 0; i < 3; i++) {
            const core = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.3 + i * 0.15),
                new THREE.MeshStandardMaterial({
                    color: 0x001111,
                    emissive: colors[i],
                    emissiveIntensity: 3,
                    transparent: true,
                    opacity: 0.7,
                })
            );
            holo.add(core);
            cores.push(core);
        }

        // Rings
        for (let i = 0; i < 3; i++) {
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(1.5 + i * 0.5, 0.02, 8, 64),
                new THREE.MeshBasicMaterial({
                    color: colors[i],
                    transparent: true,
                    opacity: 0.3,
                })
            );
            ring.rotation.x = (Math.PI / 3) * i;
            ring.rotation.z = (Math.PI / 4) * i;
            holo.add(ring);
            cores.push(ring); // reuse for animation
        }

        // Light
        holo.add(new THREE.PointLight(COLORS.neonBlue, 2, 15));

        this.group.add(holo);

        // Pedestal
        const ped = new THREE.Mesh(
            new THREE.CylinderGeometry(1.2, 1.5, 0.3, 12),
            new THREE.MeshStandardMaterial({
                color: COLORS.darkPanel,
                emissive: COLORS.neonBlue,
                emissiveIntensity: 0.2,
                metalness: 0.6,
            })
        );
        ped.position.set(0, 0.15, 0);
        this.group.add(ped);

        this.colliders.push(new THREE.Box3(
            new THREE.Vector3(-1.5, this.floorY, -1.5),
            new THREE.Vector3(1.5, this.floorY + 0.5, 1.5)
        ));

        // Animate
        this.animatedObjects.push({
            update(delta) {
                sphere.rotation.y += delta * 0.1;
                sphere.rotation.x += delta * 0.05;
                cores[0].rotation.y += delta * 0.5;
                cores[1].rotation.y -= delta * 0.3;
                cores[1].rotation.x += delta * 0.2;
                cores[2].rotation.z += delta * 0.4;
                // Rings
                if (cores[3]) cores[3].rotation.z += delta * 0.2;
                if (cores[4]) cores[4].rotation.y += delta * 0.15;
                if (cores[5]) cores[5].rotation.x += delta * 0.25;
            }
        });

        // Interactive completion terminal at base
        this.interactables.push({
            mesh: ped,
            onInteract: () => this._showCompletionScreen(),
        });
    }

    _showCompletionScreen() {
        const content = document.getElementById('terminal-content');
        const overlay = document.getElementById('terminal-overlay');
        const fragCount = state.fragments.collected.size;
        const fragTotal = state.fragments.total;

        const elapsed = state.startTime
            ? Math.floor((performance.now() - state.startTime) / 1000)
            : 0;
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;

        const allFragments = fragCount >= fragTotal;
        const solved = state.puzzlesSolved.size;
        const stars = solved >= 3 ? '★★★' : solved >= 2 ? '★★☆' : solved >= 1 ? '★☆☆' : '☆☆☆';

        content.innerHTML = `
            <div style="text-align:center;padding:0.5rem 0">
                <div style="font-size:2.5rem;letter-spacing:0.08em;color:#00d4ff;text-shadow:0 0 20px #00d4ff;font-family:'Orbitron',monospace">
                    🎉 GLÜCKWUNSCH! 🎉
                </div>
                <div style="font-size:1rem;color:#00ff88;margin:0.4rem 0 0.8rem">
                    CYBER::TOWER DURCHQUERT
                </div>
                <div style="font-size:1.6rem;color:#ffaa00;letter-spacing:0.15em">${stars}</div>
            </div>
            <div style="margin:1rem 0;padding:0.9rem;border:1px solid rgba(0,212,255,0.25);background:rgba(0,10,25,0.7);border-radius:4px">
                <p style="margin:0.3rem 0">◆ Rätsel gelöst: <strong style="color:#00ff88">${solved} / 3</strong></p>
                <p style="margin:0.3rem 0">◆ Datenfragmente: <strong style="color:#00ff88">${fragCount} / ${fragTotal}</strong></p>
                <p style="margin:0.3rem 0">◆ Spielzeit: <strong style="color:#00d4ff">${minutes}:${String(seconds).padStart(2, '0')}</strong></p>
            </div>
            ${allFragments ? `
                <div style="text-align:center;padding:0.5rem;background:rgba(255,45,120,0.1);border:1px solid rgba(255,45,120,0.4);border-radius:4px;margin-bottom:0.8rem">
                    <p style="color:#ff2d78;font-size:1rem;margin:0">🔓 ALLE FRAGMENTE — GEHEIMRAUM OFFEN!</p>
                </div>
            ` : `
                <p style="text-align:center;color:#556677;font-size:0.85rem;margin-bottom:0.6rem">
                    ${fragTotal - fragCount} Fragmente noch versteckt — komm wieder!
                </p>
            `}
            <p style="text-align:center;color:#778899;font-size:0.82rem">
                Weiter geht's mit dem Quiz auf itslearning! 🚀
            </p>
        `;
        overlay.classList.remove('hidden');
        state.terminalOpen = true;
        state.emit('openTerminal');

        // Auto-launch fireworks celebration!
        setTimeout(() => {
            const fw = window._cyberTower?.fireworks;
            if (fw) { fw.setOrigin(0, this.floorY + 1, 0); fw.launch(8); }
        }, 300);
    }

    // ── Secret Room ─────────────────────────────

    _buildSecretRoom() {
        // Hidden room behind the north railing — opens when all fragments found
        const sz = ROOM_SIZE / 2;
        const secretZ = -sz - 3;
        const secretW = 8;
        const secretH = ROOM_HEIGHT;
        const secretD = 6;

        // Secret room walls
        const secretMat = new THREE.MeshStandardMaterial({
            color: 0x0d0d1a,
            roughness: 0.8,
            metalness: 0.2,
        });

        // Floor
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(secretW, secretD),
            new THREE.MeshStandardMaterial({ color: COLORS.darkFloor, roughness: 0.9 })
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(0, 0, secretZ);
        this.group.add(floor);

        // Walls
        this.addBox(0, 0, secretZ - secretD / 2, secretW, secretH, 0.4, secretMat);
        this.addBox(-secretW / 2, 0, secretZ, 0.4, secretH, secretD, secretMat);
        this.addBox(secretW / 2, 0, secretZ, 0.4, secretH, secretD, secretMat);

        // Ceiling
        const ceil = new THREE.Mesh(
            new THREE.PlaneGeometry(secretW, secretD),
            new THREE.MeshStandardMaterial({ color: 0x0a0a14, roughness: 0.95 })
        );
        ceil.rotation.x = Math.PI / 2;
        ceil.position.y = secretH;
        ceil.position.z = secretZ;
        this.group.add(ceil);

        // Special content inside
        const trophyMat = new THREE.MeshStandardMaterial({
            color: 0x332200,
            emissive: 0xffaa00,
            emissiveIntensity: 2.5,
            metalness: 0.8,
            roughness: 0.2,
        });
        const trophy = new THREE.Mesh(
            new THREE.IcosahedronGeometry(0.8, 2),
            trophyMat
        );
        trophy.position.set(0, 2, secretZ);
        this.group.add(trophy);

        this.addLight(0, 3, secretZ, 0xffaa00, 2, 10);
        this.addTextPlane('DATENKERN', 0, 3.5, secretZ - secretD / 2 + 0.5, 4, 0.5, {
            color: '#ffaa00', fontSize: 30,
        });
        this.addTextPlane('[E] SCANNEN', 0, 1.2, secretZ + secretD / 2 - 0.3, 3, 0.3, {
            color: CSS_COLORS.neonBlue, fontSize: 16,
        });

        this.animatedObjects.push({
            update(delta) {
                trophy.rotation.y += delta * 0.5;
                trophy.rotation.x = Math.sin(performance.now() * 0.001) * 0.2;
                trophy.position.y = 2 + Math.sin(performance.now() * 0.0015) * 0.2;
            }
        });

        // Press E on Datenkern → activate weapon system
        this.interactables.push({
            mesh: trophy,
            onInteract: () => {
                window._cyberTower?.weapon?.activate();
                showNotification('🔑 DATENKERN GESCANNT — LASER-WAFFE FREIGESCHALTET!');
            },
        });

        // Door blocker (north railing section that opens)
        const doorMat = new THREE.MeshStandardMaterial({
            color: COLORS.darkPanel,
            emissive: COLORS.neonPink,
            emissiveIntensity: 0.1,
            metalness: 0.5,
        });
        this.secretDoor = this.addBox(0, 0, -sz, secretW, 1.2, 0.4, doorMat);

        // Label
        this.addTextPlane('GEHEIMRAUM', 0, 1.5, -sz + 0.5, 3, 0.3, {
            color: CSS_COLORS.neonPink, fontSize: 18,
        });

        // Listen for all fragments collected
        state.on('fragmentCollected', ({ count, total }) => {
            if (count >= total && !this.secretOpen) {
                this._openSecretDoor();
            }
        });
    }

    _openSecretDoor() {
        this.secretOpen = true;
        if (this.secretDoor) {
            this.secretDoor.visible = false;
            // Remove the collider for the door (last wall collider added)
            // Find and remove the door collider
            const sz = ROOM_SIZE / 2;
            const doorZ = this.floorY; // not used for Z, colliders Z is local
            this.colliders = this.colliders.filter(box => {
                const center = new THREE.Vector3();
                box.getCenter(center);
                // Remove the railing collider at the north edge (z ≈ -sz)
                return !(Math.abs(center.z - (-sz)) < 1 && Math.abs(center.x) < 5);
            });
        }
        showNotification('GEHEIMRAUM GEÖFFNET!');
    }

    // ── Firework Launch Pads ─────────────────────────

    _buildFireworkPads() {
        const padPositions = [
            [-6, 0, 8], [0, 0, 8], [6, 0, 8],
        ];
        const padMat = new THREE.MeshStandardMaterial({
            color: 0x0a0a1a, emissive: 0xff6600, emissiveIntensity: 0.5,
            metalness: 0.6, roughness: 0.4,
        });
        const btnMat = new THREE.MeshStandardMaterial({
            color: 0x220000, emissive: 0xff2200, emissiveIntensity: 2,
            metalness: 0.5, roughness: 0.3,
        });

        for (const [x, y, z] of padPositions) {
            // Launch pad base
            const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.3, 12), padMat);
            base.position.set(x, 0.15, z);
            this.group.add(base);

            // Red launch button
            const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.12, 10), btnMat);
            btn.position.set(x, 0.36, z);
            this.group.add(btn);

            // Glow
            const gl = new THREE.PointLight(0xff4400, 1, 4);
            gl.position.set(x, 0.5, z);
            this.group.add(gl);

            this.addTextPlane('[E] FEUERWERK', x, 0.7, z, 2.5, 0.3, {
                color: '#ff6600', fontSize: 14,
            });

            // Interactable
            this.interactables.push({
                mesh: btn,
                onInteract: () => {
                    const fw = window._cyberTower?.fireworks;
                    if (fw) {
                        fw.setOrigin(x, this.floorY + 1, z);
                        fw.launch(6);
                        showNotification('🎆 FEUERWERK GESTARTET!');
                    }
                },
            });
        }

        // Extra hint sign
        this.addTextPlane('FEUERWERK-STARTPADS', 0, 1.4, 9.5, 6, 0.4, {
            color: '#ff6600', fontSize: 22,
        });
    }

    // ── Hoverboard Spawn ─────────────────────────

    _buildHoverboardSpawn() {
        const x = -8, z = 2;
        // Platform it rests on
        const platMat = new THREE.MeshStandardMaterial({
            color: 0x001122, emissive: 0x00d4ff, emissiveIntensity: 0.3,
            metalness: 0.8, roughness: 0.2,
        });
        const plat = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 1.2), platMat);
        plat.position.set(x, 0.06, z);
        this.group.add(plat);

        this.addLight(x, 1, z, 0x00d4ff, 1.5, 6);
        this.addTextPlane('HOVERBOARD', x, 1.0, z - 0.8, 3.5, 0.4, {
            color: CSS_COLORS.neonBlue, fontSize: 20,
        });
        this.addTextPlane('[E] EINSTEIGEN', x, 0.6, z - 0.8, 3, 0.28, {
            color: CSS_COLORS.dim, fontSize: 14,
        });

        // Interactable — mount the hoverboard (managed in main.js)
        this.interactables.push({
            mesh: plat,
            onInteract: () => {
                const hb = window._cyberTower?.hoverboard;
                if (hb && !hb.mounted) hb.mount();
            },
        });
    }

    // ── Sky Rings (fly through with hoverboard) ──

    _buildSkyRings() {
        const ringDefs = [
            { x:  8, y:  7, z: -6,  R: 3.0, color: 0x00ffcc },
            { x: -6, y: 10, z: -8,  R: 2.5, color: 0xff2d78 },
            { x:  0, y: 14, z:  4,  R: 3.5, color: 0xffaa00 },
            { x:  9, y: 18, z:  2,  R: 2.8, color: 0x00d4ff },
            { x: -9, y: 15, z:  6,  R: 3.2, color: 0xcc44ff },
            { x:  3, y: 22, z: -10, R: 2.6, color: 0x00ff88 },
        ];

        ringDefs.forEach((def, idx) => {
            const { x, y, z, R, color } = def;
            const mat = new THREE.MeshStandardMaterial({
                color: new THREE.Color(color).multiplyScalar(0.15),
                emissive: color, emissiveIntensity: 2.5,
                transparent: true, opacity: 0.9,
                side: THREE.DoubleSide,
            });
            // Vertical ring (rotate so player flies horizontally through it)
            const ring = new THREE.Mesh(new THREE.TorusGeometry(R, 0.15, 12, 48), mat);
            ring.position.set(x, y, z);
            // Tilt rings slightly for visual variety
            ring.rotation.x = (idx % 3 - 1) * 0.3;
            ring.rotation.z = (idx % 2 - 0.5) * 0.25;
            this.group.add(ring);

            // Inner glow point
            const gl = new THREE.PointLight(color, 1.5, R * 3);
            gl.position.set(x, y, z);
            this.group.add(gl);

            // Number label
            this.addTextPlane(`${idx + 1}`, x, y + R + 0.5, z, 1, 0.5, {
                color: `#${color.toString(16).padStart(6, '0')}`, fontSize: 36,
            });

            this.skyRings.push({
                worldPos: new THREE.Vector3(x, this.floorY + y, z),
                outerR: R, tubeR: 0.15, idx,
            });

            // Spin animation
            this.animatedObjects.push({
                update(delta) { ring.rotation.y += delta * 0.3; gl.intensity = 1.2 + Math.sin(performance.now() * 0.002 + idx) * 0.4; }
            });
        });

        this.addTextPlane('FLIEG DURCH DIE RINGE!', -8, 3, -3, 6, 0.5, {
            color: CSS_COLORS.neonBlue, fontSize: 20,
        });
    }

    /** Called from main.js each frame while on dach + hoverboard mounted */
    checkRings(camera) {
        for (const ring of this.skyRings) {
            if (this.ringsHit.has(ring.idx)) continue;
            const dx = camera.position.x - ring.worldPos.x;
            const dy = camera.position.y - ring.worldPos.y;
            const dz = camera.position.z - ring.worldPos.z;
            // Check if inside the torus: |sqrt(dx²+dz²) - R| < r+0.5 AND |dy| < r+0.5
            const radialDist = Math.abs(Math.sqrt(dx * dx + dz * dz) - ring.outerR);
            if (radialDist < ring.tubeR + 0.7 && Math.abs(dy) < ring.tubeR + 0.8) {
                this.ringsHit.add(ring.idx);
                const count = this.ringsHit.size;
                showNotification(`🟡 RING ${ring.idx + 1} DURCHFLOGEN! (${count}/6)`);
                if (count === this.skyRings.length) {
                    showNotification('🏆 ALLE RINGE DURCHFLOGEN! PERFEKT!');
                    window._cyberTower?.fireworks?.launch(12);
                }
            }
        }
    }

    // ── Elevator ────────────────────────────────

    _buildElevator() {
        const ez = ROOM_SIZE / 2 - 0.6;
        const doorW = 1.4, doorH = 3.0;

        // Full height walls around elevator area on roof
        const wallMat = new THREE.MeshStandardMaterial({
            color: COLORS.darkPanel, roughness: 0.85, metalness: 0.15,
        });

        // Elevator shaft walls (raised section on roof)
        this.addBox(0, 0, ez, doorW * 2 + 2, doorH + 0.5, 1.5, wallMat);

        // Cut out for doors (add frame and doors on top)
        const frameMat = new THREE.MeshStandardMaterial({
            color: 0x0a0a18, emissive: COLORS.neonBlue, emissiveIntensity: 0.12,
            metalness: 0.5, roughness: 0.5,
        });
        this.addBox(0, doorH, ez - 0.5, doorW * 2 + 0.6, 0.3, 0.4, frameMat, { collider: false });

        const doorMat = new THREE.MeshStandardMaterial({
            color: 0x0d0d20, emissive: COLORS.neonBlue, emissiveIntensity: 0.04,
            metalness: 0.7, roughness: 0.4,
        });
        this.addBox(-doorW / 2, 0, ez - 0.5, doorW, doorH, 0.15, doorMat, { collider: false });
        this.addBox(doorW / 2, 0, ez - 0.5, doorW, doorH, 0.15, doorMat, { collider: false });

        this.addNeonStrip(0, doorH + 0.35, ez - 0.5, doorW * 2, 'x', COLORS.neonBlue, 2.5);
        this.addTextPlane('AUFZUG', 0, doorH + 0.8, ez - 0.6, 3, 0.5, {
            color: CSS_COLORS.neonBlue, fontSize: 36,
            rotY: Math.PI,
        });

        const panel = createElevatorPanel(THREE, this, doorW + 0.5, 1.3, ez - 0.65, state.unlockedFloors, Math.PI);
        this.interactables.push(panel);
    }

    // ── Particles (stars + data streams) ────────

    _buildParticles() {
        // Stars above
        const starCount = 300;
        const starPos = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) {
            starPos[i * 3]     = (Math.random() - 0.5) * 100;
            starPos[i * 3 + 1] = 8 + Math.random() * 40;
            starPos[i * 3 + 2] = (Math.random() - 0.5) * 100;
        }
        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
        const starMat = new THREE.PointsMaterial({
            color: 0xffffff, size: 0.15,
            transparent: true, opacity: 0.7,
            blending: THREE.AdditiveBlending, depthWrite: false,
        });
        this.group.add(new THREE.Points(starGeo, starMat));

        // Data stream particles rising from the tower
        const dataCount = 80;
        const dataPos = new Float32Array(dataCount * 3);
        const S = 5;
        for (let i = 0; i < dataCount; i++) {
            dataPos[i * 3]     = (Math.random() - 0.5) * S * 2;
            dataPos[i * 3 + 1] = Math.random() * 15;
            dataPos[i * 3 + 2] = (Math.random() - 0.5) * S * 2;
        }
        const dataGeo = new THREE.BufferGeometry();
        dataGeo.setAttribute('position', new THREE.BufferAttribute(dataPos, 3));
        const dataMat = new THREE.PointsMaterial({
            color: COLORS.neonBlue, size: 0.08,
            transparent: true, opacity: 0.5,
            blending: THREE.AdditiveBlending, depthWrite: false,
        });
        this.group.add(new THREE.Points(dataGeo, dataMat));

        this.animatedObjects.push({
            update(delta) {
                // Stars twinkle
                const t = performance.now() * 0.001;
                starMat.opacity = 0.5 + Math.sin(t * 0.5) * 0.2;

                // Data streams rise
                const pos = dataGeo.attributes.position.array;
                for (let i = 0; i < pos.length; i += 3) {
                    pos[i + 1] += delta * 1.5;
                    if (pos[i + 1] > 15) {
                        pos[i + 1] = 0;
                        pos[i] = (Math.random() - 0.5) * S * 2;
                        pos[i + 2] = (Math.random() - 0.5) * S * 2;
                    }
                }
                dataGeo.attributes.position.needsUpdate = true;
            }
        });
    }

    getSpawnPoint() {
        return new THREE.Vector3(0, this.floorY + 1.7, 10);
    }
}
