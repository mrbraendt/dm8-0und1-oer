// ============================================
// CYBER::TOWER — Pixel Room (F2: PIXEL)
// Digital image representation: 8×8 pixel grid
// Gate: draw the key symbol pattern
// ============================================

import * as THREE from 'three';
import { Room } from './Room.js';
import { COLORS, CSS_COLORS, ROOM_SIZE, ROOM_HEIGHT, FLOORS } from '../constants.js';
import { state } from '../state.js';
import { showNotification } from '../hud.js';
import { createElevatorPanel } from '../elevator.js';

// Target pattern: simple cross / plus (8×8 grid, 1 = filled)
// Target pattern: classic space invader (cyberpunk theme)
const KEY_PATTERN = [
    [0,0,1,0,0,0,1,0],
    [0,0,0,1,1,0,0,0],
    [0,1,1,1,1,1,1,0],
    [1,1,0,1,1,0,1,1],
    [1,1,1,1,1,1,1,1],
    [0,1,1,0,0,1,1,0],
    [0,1,0,0,0,0,1,0],
    [1,0,1,0,0,1,0,1],
];

export class PixelRoom extends Room {
    constructor() {
        super('pixel', FLOORS.pixel.index);
        this.grid = [];           // 8×8 array of { mesh, on: boolean }
        this.gridSize = 8;
    }

    build() {
        const { wallMat } = this.buildShell(COLORS.neonBlue);

        this._buildPixelWall();
        this._buildPreview();
        this._buildInfoTerminal();
        this._buildCheckButton();
        this._buildElevator(wallMat);
        this._buildDecoLights();
        this._buildParticles();
        this._buildMovingPlatforms();

        return this.group;
    }

    // ── 8×8 Pixel Wall ──────────────────────────

    _buildPixelWall() {
        const blockSize = 0.5;
        const gap = 0.06;
        const step = blockSize + gap;
        const totalW = this.gridSize * step - gap;
        const startX = -totalW / 2 + blockSize / 2;
        const startY = 0.3;
        const z = -ROOM_SIZE / 2 + 2.5;

        // Title — positioned just below ceiling
        const topTileY = startY + (this.gridSize - 1) * step + blockSize;
        this.addTextPlane('PIXEL-MATRIX [8×8]', 0, Math.min(topTileY + 0.2, ROOM_HEIGHT - 0.3), z, 6, 0.35, {
            color: CSS_COLORS.neonBlue,
            fontSize: 24,
        });

        const offMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            emissive: 0x111122,
            emissiveIntensity: 0.15,
            roughness: 0.5,
            metalness: 0.3,
        });

        const onMat = new THREE.MeshStandardMaterial({
            color: 0x003355,
            emissive: COLORS.neonBlue,
            emissiveIntensity: 1.2,
            roughness: 0.4,
            metalness: 0.5,
        });

        // Wire-frame edges to make each tile clearly visible
        const edgeMat = new THREE.LineBasicMaterial({ color: 0x335577, transparent: true, opacity: 0.6 });

        this.grid = [];
        for (let row = 0; row < this.gridSize; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                const x = startX + col * step;
                const y = startY + (this.gridSize - 1 - row) * step; // row 0 at top

                const geo = new THREE.BoxGeometry(blockSize, blockSize, 0.3);
                const mesh = new THREE.Mesh(geo, offMat.clone());
                mesh.position.set(x, y + blockSize / 2, z);
                this.group.add(mesh);

                // Wireframe outline for visibility
                const edges = new THREE.LineSegments(
                    new THREE.EdgesGeometry(geo),
                    edgeMat
                );
                edges.position.copy(mesh.position);
                this.group.add(edges);

                const cell = { mesh, on: false, row, col, offMat: mesh.material, onMat };
                this.grid[row][col] = cell;

                // Register as interactable
                this.interactables.push({
                    mesh,
                    onInteract: () => this._togglePixel(cell),
                });
            }
        }

        // Collider for the pixel wall (prevents walking through)
        this.colliders.push(new THREE.Box3(
            new THREE.Vector3(-totalW / 2 - 0.2, this.floorY, z - 0.3),
            new THREE.Vector3(totalW / 2 + 0.2, this.floorY + startY + this.gridSize * step, z + 0.3)
        ));
    }

    _togglePixel(cell) {
        cell.on = !cell.on;
        if (cell.on) {
            cell.mesh.material = cell.onMat;
        } else {
            cell.mesh.material = cell.offMat;
        }
    }

    // ── Pattern Preview (hint) ──────────────────

    _buildPreview() {
        // Show a small hint of the target pattern on a side terminal
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#0a0a15';
        ctx.fillRect(0, 0, 256, 256);

        const cellSize = 256 / this.gridSize;
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                if (KEY_PATTERN[r][c]) {
                    ctx.fillStyle = 'rgba(0,212,255,0.5)';
                    ctx.fillRect(c * cellSize + 1, r * cellSize + 1, cellSize - 2, cellSize - 2);
                }
                // Grid line
                ctx.strokeStyle = 'rgba(0,212,255,0.15)';
                ctx.strokeRect(c * cellSize, r * cellSize, cellSize, cellSize);
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        const mat = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
        });
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.5), mat);
        plane.position.set(10, 2.5, -8);
        plane.rotation.y = -Math.PI / 4;
        this.group.add(plane);

        // Label "ZIELMUSTER"
        this.addTextPlane('ZIELMUSTER', 10, 4.2, -8, 3, 0.4, {
            color: CSS_COLORS.neonBlue,
            fontSize: 22,
        });
    }

    // ── Check Button ────────────────────────────

    _buildCheckButton() {
        const x = 0, y = 0.3, z = -ROOM_SIZE / 2 + 6;
        const group = new THREE.Group();

        const btnMat = new THREE.MeshStandardMaterial({
            color: 0x0a0a1a,
            emissive: COLORS.neonBlue,
            emissiveIntensity: 0.4,
            metalness: 0.4,
            roughness: 0.5,
        });
        const btn = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.6, 0.5), btnMat);
        btn.position.set(x, y + 0.3, z);
        group.add(btn);

        this.addTextPlane('GATE PRÜFEN', x, y + 0.35, z + 0.3, 2.2, 0.4, {
            color: CSS_COLORS.neonBlue,
            fontSize: 24,
        });

        this.group.add(group);

        this.colliders.push(new THREE.Box3(
            new THREE.Vector3(x - 1.3, this.floorY + y, z - 0.3),
            new THREE.Vector3(x + 1.3, this.floorY + y + 0.7, z + 0.3)
        ));

        this.interactables.push({
            mesh: group,
            onInteract: () => this._checkGate(),
        });
    }

    _checkGate() {
        let correct = true;
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                const expected = KEY_PATTERN[r][c] === 1;
                if (this.grid[r][c].on !== expected) {
                    correct = false;
                    break;
                }
            }
            if (!correct) break;
        }

        if (correct) {
            state.solvePuzzle('pixel');
            state.unlockFloor('krypto');
            showNotification('GATE DURCHBROCHEN! Aufzug zu F3: KRYPTO freigeschaltet.');

            // Visual: flash all pixels blue
            for (let r = 0; r < this.gridSize; r++) {
                for (let c = 0; c < this.gridSize; c++) {
                    this.grid[r][c].mesh.material = this.grid[r][c].onMat;
                }
            }
        } else {
            // Count how many pixels are correct
            let correctCount = 0;
            for (let r = 0; r < this.gridSize; r++) {
                for (let c = 0; c < this.gridSize; c++) {
                    if (this.grid[r][c].on === (KEY_PATTERN[r][c] === 1)) correctCount++;
                }
            }
            showNotification(`${correctCount}/64 Pixel korrekt. Vergleiche mit dem Zielmuster!`);
        }
    }

    // ── Info Terminal ────────────────────────────

    _buildInfoTerminal() {
        const x = -10, z = 8;
        const group = new THREE.Group();

        const baseMat = new THREE.MeshStandardMaterial({ color: 0x0c0c1a, metalness: 0.5, roughness: 0.5 });
        const screenMat = new THREE.MeshStandardMaterial({
            color: 0x001a2a, emissive: COLORS.neonBlue, emissiveIntensity: 0.3,
        });

        group.add(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.8, 8), baseMat).translateY(0.4).translateX(x).translateZ(z));
        const screen = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.05), screenMat);
        screen.position.set(x, 1.15, z);
        screen.rotation.x = -0.3;
        group.add(screen);

        this.group.add(group);

        this.colliders.push(new THREE.Box3(
            new THREE.Vector3(x - 0.6, this.floorY, z - 0.6),
            new THREE.Vector3(x + 0.6, this.floorY + 1.5, z + 0.6)
        ));

        this.interactables.push({
            mesh: group,
            onInteract: () => {
                const content = document.getElementById('terminal-content');
                const overlay = document.getElementById('terminal-overlay');
                content.innerHTML = `
                    <h2>WIE WERDEN BILDER GESPEICHERT?</h2>
                    <p>Jedes digitale Bild besteht aus <strong style="color:#00d4ff">Pixeln</strong> — winzigen Bildpunkten, die in einem Raster angeordnet sind.</p>
                    <p>Das einfachste Format ist eine <strong style="color:#00d4ff">Bitmap</strong>: Jeder Pixel ist entweder an (1) oder aus (0). Das ergibt ein Schwarz-Weiß-Bild.</p>
                    <p>Ein 8×8-Pixel-Bild braucht genau 64 Bit = 8 Byte Speicherplatz.</p>
                    <p>Moderne Bilder nutzen 24 Bit pro Pixel (je 8 für Rot, Grün, Blau) — das ergibt 16,7 Millionen mögliche Farben!</p>
                    <p style="color:#ff2d78">Aufgabe: Zeichne das Kreuz-Symbol vom Zielmuster in die Pixel-Matrix.</p>
                `;
                overlay.classList.remove('hidden');
                state.terminalOpen = true;
                state.emit('openTerminal');
            },
        });
    }

    // ── Elevator ────────────────────────────────

    _buildElevator(wallMat) {
        const ez = ROOM_SIZE / 2 - 0.6;
        const doorW = 1.4, doorH = 3.0;

        const frameMat = new THREE.MeshStandardMaterial({
            color: 0x0a0a18, emissive: COLORS.neonBlue, emissiveIntensity: 0.12,
            metalness: 0.5, roughness: 0.5,
        });
        this.addBox(0, doorH, ez, doorW * 2 + 0.6, 0.3, 0.4, frameMat, { collider: false });
        this.addBox(-doorW - 0.15, 0, ez, 0.3, doorH, 0.4, frameMat, { collider: false });
        this.addBox(doorW + 0.15, 0, ez, 0.3, doorH, 0.4, frameMat, { collider: false });

        const doorMat = new THREE.MeshStandardMaterial({
            color: 0x0d0d20, emissive: COLORS.neonBlue, emissiveIntensity: 0.04,
            metalness: 0.7, roughness: 0.4,
        });
        this.addBox(-doorW / 2, 0, ez, doorW, doorH, 0.15, doorMat, { collider: false });
        this.addBox(doorW / 2, 0, ez, doorW, doorH, 0.15, doorMat, { collider: false });

        this.colliders.push(new THREE.Box3(
            new THREE.Vector3(-doorW - 0.2, this.floorY, ez - 0.3),
            new THREE.Vector3(doorW + 0.2, this.floorY + doorH, ez + 0.3)
        ));

        this.addNeonStrip(0, doorH + 0.35, ez, doorW * 2, 'x', COLORS.neonBlue, 2.5);
        this.addTextPlane('AUFZUG', 0, doorH + 0.8, ez - 0.1, 3, 0.5, {
            color: CSS_COLORS.neonBlue, fontSize: 36,
            rotY: Math.PI,
        });

        const panel = createElevatorPanel(THREE, this, doorW + 0.5, 1.3, ez - 0.15, state.unlockedFloors, Math.PI);
        this.interactables.push(panel);
    }

    // ── Decoration ──────────────────────────────

    _buildDecoLights() {
        this.addTextPlane('F2: PIXEL', 0, 4.2, -ROOM_SIZE / 2 + 0.6, 6, 0.8, {
            color: CSS_COLORS.neonBlue, fontSize: 44,
        });
        this.addTextPlane('DIGITALE DARSTELLUNG', 0, 3.5, -ROOM_SIZE / 2 + 0.6, 6, 0.4, {
            color: CSS_COLORS.dim, fontSize: 20,
        });

        this.addLight(0, 4, 0, COLORS.neonBlue, 1.2, 20);
        this.addLight(0, 3, -ROOM_SIZE / 2 + 5, 0xffffff, 0.8, 15); // extra light on pixel wall
        this.addLight(-10, 2, -10, COLORS.neonBlue, 0.4, 10);
        this.addLight(10, 2, -10, COLORS.neonBlue, 0.4, 10);

        // Pixel-art decorations on side walls
        const pixMat = new THREE.MeshStandardMaterial({
            color: 0x002244, emissive: COLORS.neonBlue, emissiveIntensity: 1,
        });
        const positions = [
            [-14.5, 3, -8], [-14.5, 3.5, -8], [-14.5, 3, -7.5],
            [14.5, 2, 3], [14.5, 2.5, 3], [14.5, 2, 3.5], [14.5, 2.5, 3.5],
        ];
        for (const [px, py, pz] of positions) {
            const block = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), pixMat);
            block.position.set(px, py, pz);
            this.group.add(block);
        }
    }

    _buildParticles() {
        // Blue pixel rain effect
        const count = 150;
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
            color: COLORS.neonBlue, size: 0.08,
            transparent: true, opacity: 0.5,
            blending: THREE.AdditiveBlending, depthWrite: false,
        });

        this.group.add(new THREE.Points(geo, mat));

        // Rain downward
        this.animatedObjects.push({
            update(delta) {
                const pos = geo.attributes.position.array;
                for (let i = 0; i < pos.length; i += 3) {
                    pos[i + 1] -= delta * 0.3;
                    if (pos[i + 1] < 0) {
                        pos[i + 1] = ROOM_HEIGHT;
                        pos[i] = (Math.random() - 0.5) * S * 2;
                        pos[i + 2] = (Math.random() - 0.5) * S * 2;
                    }
                }
                geo.attributes.position.needsUpdate = true;
            }
        });
    }

    // ── Moving Platforms ─────────────────────────

    _buildMovingPlatforms() {
        this.addMovingPlatform(-6, 1.4, -2, 2.4, 0.22, 1.2, 'x', 3.5, 0.8);
        this.addMovingPlatform( 6, 2.2,  3, 2.2, 0.22, 1.2, 'z', 4.0, 0.6);
    }

    getSpawnPoint() {
        return new THREE.Vector3(0, this.floorY + 1.7, 10);
    }
}
