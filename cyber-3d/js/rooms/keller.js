// ============================================
// CYBER::TOWER — Keller Room (B1: HARDWARE)
// Bits & Bytes: 8 physical toggle switches
// Gate: enter binary for ASCII "Hi" (01001000 01101001)
// ============================================

import * as THREE from 'three';
import { Room } from './Room.js';
import { COLORS, CSS_COLORS, ROOM_SIZE, ROOM_HEIGHT, FLOORS } from '../constants.js';
import { state } from '../state.js';
import { showNotification } from '../hud.js';
import { createElevatorPanel } from '../elevator.js';

export class KellerRoom extends Room {
    constructor() {
        super('keller', FLOORS.keller.index);
        this.bitCells = [];  // { on, index, borderMats, cvs, ctx, tex }
        this.asciiDisplay = null;
    }

    build() {
        const { wallMat } = this.buildShell(COLORS.neonGreen);

        this._buildIndustrialDecor();
        this._buildSwitchWall();
        this._buildInfoTerminal();
        this._buildElevator(wallMat);
        this._buildParticles();
        this._buildMovingPlatforms();

        // Add keyboard shortcuts for bit toggling (1-8 keys)
        this._setupKeyboardShortcuts();

        return this.group;
    }

    _setupKeyboardShortcuts() {
        const handleKeyDown = (e) => {
            // Keys 1-8 toggle bits 0-7
            if (e.code >= 'Digit1' && e.code <= 'Digit8') {
                const bitIndex = parseInt(e.code.charAt(5)) - 1; // Extract digit from 'Digit#'
                if (bitIndex >= 0 && bitIndex < this.bitCells.length) {
                    this._flipCell(this.bitCells[bitIndex]);
                    e.preventDefault();
                }
            }
        };
        this._keydownListener = handleKeyDown;
        document.addEventListener('keydown', this._keydownListener);
    }

    destructor() {
        if (this._keydownListener) {
            document.removeEventListener('keydown', this._keydownListener);
        }
    }

    // ── Industrial Decoration ───────────────────

    _buildIndustrialDecor() {
        const pipeMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a28,
            metalness: 0.7,
            roughness: 0.3,
        });

        // Horizontal pipes along ceiling
        const pipePositions = [
            [-12, ROOM_HEIGHT - 0.4, -8], [12, ROOM_HEIGHT - 0.4, -8],
            [-12, ROOM_HEIGHT - 0.4, 4],  [12, ROOM_HEIGHT - 0.4, 4],
        ];
        for (let i = 0; i < pipePositions.length; i += 2) {
            const [x1, y1, z1] = pipePositions[i];
            const [x2] = pipePositions[i + 1];
            const pipe = new THREE.Mesh(
                new THREE.CylinderGeometry(0.12, 0.12, Math.abs(x2 - x1), 8),
                pipeMat
            );
            pipe.rotation.z = Math.PI / 2;
            pipe.position.set((x1 + x2) / 2, y1, z1);
            this.group.add(pipe);
        }

        // Vertical pipes (corners)
        const vPipes = [[-13, -13], [13, -13], [-13, 13], [13, 13]];
        for (const [x, z] of vPipes) {
            const pipe = new THREE.Mesh(
                new THREE.CylinderGeometry(0.1, 0.1, ROOM_HEIGHT, 8),
                pipeMat
            );
            pipe.position.set(x, ROOM_HEIGHT / 2, z);
            this.group.add(pipe);
        }

        // CRT monitor deco on side walls
        const crtMat = new THREE.MeshStandardMaterial({
            color: 0x0a0a12,
            emissive: COLORS.neonGreen,
            emissiveIntensity: 0.15,
            metalness: 0.3,
            roughness: 0.6,
        });
        const crtPositions = [
            [-ROOM_SIZE / 2 + 0.6, 2.5, -5, Math.PI / 2],
            [-ROOM_SIZE / 2 + 0.6, 2.5, 5, Math.PI / 2],
            [ROOM_SIZE / 2 - 0.6, 2.5, -5, -Math.PI / 2],
            [ROOM_SIZE / 2 - 0.6, 2.5, 5, -Math.PI / 2],
        ];
        for (const [x, y, z, rot] of crtPositions) {
            const crt = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.6, 0.8), crtMat);
            crt.position.set(x, y, z);
            crt.rotation.y = rot;
            this.group.add(crt);
        }

        // Title
        this.addTextPlane('B1: HARDWARE', 0, 4.2, -ROOM_SIZE / 2 + 0.6, 8, 0.8, {
            color: CSS_COLORS.neonGreen,
            fontSize: 44,
        });

        this.addTextPlane('BITS & BYTES', 0, 3.5, -ROOM_SIZE / 2 + 0.6, 6, 0.5, {
            color: CSS_COLORS.dim,
            fontSize: 22,
        });

        // Ambient green light
        this.addLight(0, 4, 0, COLORS.neonGreen, 1.0, 20);
        this.addLight(-8, 2, -10, COLORS.neonGreen, 0.5, 10);
        this.addLight(8, 2, -10, COLORS.neonGreen, 0.5, 10);
    }

    // ── 8-Bit Flip-Cell Wall ──────────────────────

    _buildSwitchWall() {
        const cellW = 1.2;
        const cellH = 1.8;
        const gap   = 0.22;
        const totalW = 8 * cellW + 7 * gap;
        const startX = -totalW / 2 + cellW / 2;
        const wallZ  = -ROOM_SIZE / 2 + 1.2;
        const baseY  = 0.9;

        // Backboard
        const boardMat = new THREE.MeshStandardMaterial({
            color: 0x060612, metalness: 0.5, roughness: 0.5,
        });
        this.addBox(0, baseY - 0.15, wallZ - 0.1, totalW + 0.8, cellH + 0.65, 0.22, boardMat, { collider: false });

        // Header
        this.addTextPlane('BINÄR-EINGABE — 8 BIT', 0, baseY + cellH + 0.32, wallZ, totalW + 0.2, 0.38, {
            color: CSS_COLORS.neonGreen, fontSize: 19, fontFamily: 'Share Tech Mono',
        });

        for (let i = 0; i < 8; i++) {
            const x = startX + i * (cellW + gap);
            this._buildBitCell(x, baseY + cellH / 2, wallZ, i);
        }

        this._buildASCIIDisplay(0, 0.35, wallZ + 1.3);
        this._buildCheckButton(0, 0.3, wallZ + 3.2);
    }

    _buildBitCell(x, y, z, index) {
        const cellW = 1.2, cellH = 1.8, cellD = 0.1;

        // Background panel
        const panelMat = new THREE.MeshStandardMaterial({
            color: 0x04040e, roughness: 0.7, metalness: 0.2,
        });
        const panel = new THREE.Mesh(new THREE.BoxGeometry(cellW, cellH, cellD), panelMat);
        panel.position.set(x, y, z);
        this.group.add(panel);

        // Border strips (4 edges, glow green when ON)
        const mkBorder = () => new THREE.MeshStandardMaterial({
            color: 0x021408, emissive: 0x00ff88, emissiveIntensity: 0.08,
            metalness: 0.4, roughness: 0.5,
        });
        const bt = 0.055;
        const bTop = new THREE.Mesh(new THREE.BoxGeometry(cellW + bt, bt, cellD + 0.02), mkBorder());
        bTop.position.set(x, y + cellH / 2, z); this.group.add(bTop);
        const bBot = new THREE.Mesh(new THREE.BoxGeometry(cellW + bt, bt, cellD + 0.02), mkBorder());
        bBot.position.set(x, y - cellH / 2, z); this.group.add(bBot);
        const bL = new THREE.Mesh(new THREE.BoxGeometry(bt, cellH + bt, cellD + 0.02), mkBorder());
        bL.position.set(x - cellW / 2, y, z); this.group.add(bL);
        const bR = new THREE.Mesh(new THREE.BoxGeometry(bt, cellH + bt, cellD + 0.02), mkBorder());
        bR.position.set(x + cellW / 2, y, z); this.group.add(bR);
        const borderMats = [bTop.material, bBot.material, bL.material, bR.material];

        // Canvas face showing '0' or '1'
        const cvs = document.createElement('canvas');
        cvs.width = 128; cvs.height = 192;
        const ctx = cvs.getContext('2d');
        const tex = new THREE.CanvasTexture(cvs);
        const faceMat = new THREE.MeshBasicMaterial({
            map: tex, transparent: true, side: THREE.FrontSide, depthWrite: false,
        });
        const face = new THREE.Mesh(new THREE.PlaneGeometry(cellW - 0.06, cellH - 0.06), faceMat);
        face.position.set(x, y, z + cellD / 2 + 0.005);
        this.group.add(face);

        const cellData = { on: false, index, borderMats, cvs, ctx, tex };
        this.bitCells.push(cellData);
        this._renderBitCell(cellData);

        // Collider
        this.colliders.push(new THREE.Box3(
            new THREE.Vector3(x - cellW / 2, this.floorY + y - cellH / 2, z - cellD),
            new THREE.Vector3(x + cellW / 2, this.floorY + y + cellH / 2, z + cellD)
        ));

        this.interactables.push({
            mesh: panel,
            onInteract: () => this._flipCell(cellData),
        });
    }

    _renderBitCell(cell) {
        const { on, cvs, ctx, tex } = cell;
        const w = cvs.width, h = cvs.height;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = on ? '#001a09' : '#050510';
        ctx.fillRect(0, 0, w, h);
        ctx.font = `bold ${Math.floor(h * 0.72)}px "Share Tech Mono", monospace`;
        ctx.fillStyle = on ? '#00ff88' : '#1e3340';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(on ? '1' : '0', w / 2, h / 2);
        tex.needsUpdate = true;
    }

    _flipCell(cell) {
        cell.on = !cell.on;
        this._renderBitCell(cell);
        const intensity = cell.on ? 3.0 : 0.08;
        for (const mat of cell.borderMats) {
            mat.emissiveIntensity = intensity;
            mat.color.setHex(cell.on ? 0x003311 : 0x021408);
        }
        this._updateASCIIDisplay();
    }

    // ── ASCII Display ───────────────────────────

    _buildASCIIDisplay(x, y, z) {
        // Canvas for showing current binary → ASCII
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 128;
        const texture = new THREE.CanvasTexture(canvas);

        const mat = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
        });
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(8, 1), mat);
        plane.position.set(x, y + 0.5, z);
        this.group.add(plane);

        this.asciiDisplay = { canvas, texture, ctx: canvas.getContext('2d') };
        this._updateASCIIDisplay();
    }

    _updateASCIIDisplay() {
        if (!this.asciiDisplay) return;
        const { canvas, texture, ctx } = this.asciiDisplay;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let binary = '';
        for (const cell of this.bitCells) {
            binary += cell.on ? '1' : '0';
        }

        const charCode = parseInt(binary, 2);
        const char = charCode >= 32 && charCode <= 126 ? String.fromCharCode(charCode) : '?';

        ctx.font = 'bold 40px "Share Tech Mono"';
        ctx.fillStyle = '#00ff88';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${binary}  →  "${char}" (${charCode})`, canvas.width / 2, canvas.height / 2);

        texture.needsUpdate = true;
    }

    // ── Check Button ────────────────────────────

    _buildCheckButton(x, y, z) {
        const group = new THREE.Group();

        const btnMat = new THREE.MeshStandardMaterial({
            color: 0x0a1a0a,
            emissive: COLORS.neonGreen,
            emissiveIntensity: 0.5,
            metalness: 0.4,
            roughness: 0.5,
        });
        const btn = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 0.6, 0.5),
            btnMat
        );
        btn.position.set(x, y + 0.3, z);
        group.add(btn);

        this.addTextPlane('GATE PRÜFEN', x, y + 0.35, z + 0.3, 2.2, 0.4, {
            color: CSS_COLORS.neonGreen,
            fontSize: 24,
            fontFamily: 'Orbitron',
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
        let binary = '';
        for (const cell of this.bitCells) {
            binary += cell.on ? '1' : '0';
        }

        const charCode = parseInt(binary, 2);

        if (charCode === 72) { // ASCII 'H' = 01001000
            state.solvePuzzle('keller');
            state.unlockFloor('pixel');
            showNotification('GATE DURCHBROCHEN! Aufzug zu F2: PIXEL freigeschaltet.');
            // Flash borders blue
            for (const cell of this.bitCells) {
                for (const mat of cell.borderMats) {
                    mat.color.setHex(0x001133);
                    mat.emissive.setHex(0x00aaff);
                    mat.emissiveIntensity = 3.0;
                }
            }
        } else {
            const char = charCode >= 32 && charCode <= 126 ? String.fromCharCode(charCode) : '?';
            showNotification(`"${char}" (${charCode}) — nicht korrekt. Tipp: Suche online nach 'ASCII Binär Tabelle'!`);
        }
    }

    // ── Info Terminal ────────────────────────────

    _buildInfoTerminal() {
        const x = 10, z = 8;
        const group = new THREE.Group();

        const screenMat = new THREE.MeshStandardMaterial({
            color: 0x001a0a,
            emissive: COLORS.neonGreen,
            emissiveIntensity: 0.3,
            metalness: 0.3,
            roughness: 0.5,
        });

        const baseMat = new THREE.MeshStandardMaterial({
            color: 0x0c0c1a,
            metalness: 0.5,
            roughness: 0.5,
        });

        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.8, 8), baseMat);
        base.position.set(x, 0.4, z);
        group.add(base);

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
                    <h2>WAS SIND BITS?</h2>
                    <p>Ein <strong style="color:#00ff88">Bit</strong> ist die kleinste Informationseinheit in der Informatik. Es kann genau zwei Zustände haben: <strong>0</strong> oder <strong>1</strong>.</p>
                    <p>8 Bits ergeben ein <strong style="color:#00ff88">Byte</strong>. Mit einem Byte kann man 256 verschiedene Werte darstellen (0–255).</p>
                    <p>Der <strong>ASCII-Code</strong> ordnet jedem Zeichen eine Zahl zu. Zum Beispiel:</p>
                    <p style="color:#00d4ff; font-family:'Share Tech Mono'">
                    A = 65 = 01000001<br>
                    B = 66 = 01000010<br>
                    H = 72 = 01001000<br>
                    i = 105 = 01101001
                    </p>
                    <p>Klicke auf die <strong style="color:#00ff88">Felder</strong>, um Bits zwischen <strong>0</strong> und <strong>1</strong> zu wechseln. Oder drücke die <strong style="color:#00d4ff">Tasten 1–8</strong> um jedes Bit schnell zu wechseln! Stelle den richtigen 8-Bit-Code ein!</p>
                    <p style="color:#00d4ff">💡 Tipp: Suche online nach <strong>"ASCII Binär Tabelle"</strong> — dort findest du alle Buchstaben als Binärcode.</p>
                    <p style="color:#ff2d78">Gesucht: der Großbuchstabe am Anfang von "Hello World".</p>
                `;
                overlay.classList.remove('hidden');
                state.terminalOpen = true;
                state.emit('openTerminal');
            },
        });
    }

    // ── Elevator ────────────────────────────────

    _buildElevator(wallMat) {
        const ez = ROOM_SIZE / 2 - 0.6; // south wall
        const doorW = 1.4;
        const doorH = 3.0;

        // Frame
        const frameMat = new THREE.MeshStandardMaterial({
            color: 0x0a0a18,
            emissive: COLORS.neonGreen,
            emissiveIntensity: 0.12,
            metalness: 0.5,
            roughness: 0.5,
        });
        this.addBox(0, doorH, ez, doorW * 2 + 0.6, 0.3, 0.4, frameMat, { collider: false });
        this.addBox(-doorW - 0.15, 0, ez, 0.3, doorH, 0.4, frameMat, { collider: false });
        this.addBox(doorW + 0.15, 0, ez, 0.3, doorH, 0.4, frameMat, { collider: false });

        // Door panels
        const doorMat = new THREE.MeshStandardMaterial({
            color: 0x0d0d20,
            emissive: COLORS.neonGreen,
            emissiveIntensity: 0.04,
            metalness: 0.7,
            roughness: 0.4,
        });
        this.addBox(-doorW / 2, 0, ez, doorW, doorH, 0.15, doorMat, { collider: false });
        this.addBox(doorW / 2, 0, ez, doorW, doorH, 0.15, doorMat, { collider: false });

        // Collider
        this.colliders.push(new THREE.Box3(
            new THREE.Vector3(-doorW - 0.2, this.floorY, ez - 0.3),
            new THREE.Vector3(doorW + 0.2, this.floorY + doorH, ez + 0.3)
        ));

        this.addNeonStrip(0, doorH + 0.35, ez, doorW * 2, 'x', COLORS.neonGreen, 2.5);
        this.addTextPlane('AUFZUG', 0, doorH + 0.8, ez - 0.1, 3, 0.5, {
            color: CSS_COLORS.neonGreen,
            fontSize: 36,
            rotY: Math.PI,
        });

        // Elevator panel
        const panel = createElevatorPanel(THREE, this,
            doorW + 0.5, 1.3, ez - 0.15,
            state.unlockedFloors,
            Math.PI  // face inward
        );
        this.interactables.push(panel);
    }

    // ── Particles (sparks) ──────────────────────

    _buildParticles() {
        const count = 120;
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
            color: COLORS.neonGreen,
            size: 0.05,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        const points = new THREE.Points(geo, mat);
        this.group.add(points);

        // Random flicker: particles appear/disappear
        this.animatedObjects.push({
            update(delta) {
                const pos = geo.attributes.position.array;
                for (let i = 0; i < pos.length; i += 3) {
                    pos[i + 1] += delta * (0.05 + Math.random() * 0.1);
                    if (pos[i + 1] > ROOM_HEIGHT) {
                        pos[i + 1] = 0;
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
        // Platform 1: glides along x near the switch wall
        const gMat = new THREE.MeshStandardMaterial({
            color: 0x0a1a0a, emissive: COLORS.neonGreen, emissiveIntensity: 0.4,
            metalness: 0.7, roughness: 0.3,
        });
        this.addMovingPlatform(-7, 1.5, -5, 2.4, 0.22, 1.2, 'x', 5.0, 0.6, gMat);
        // Platform 2: higher, slower, near center
        this.addMovingPlatform( 4, 2.3,  1, 2.2, 0.22, 1.0, 'z', 5.5, 0.5, gMat);
    }
    // ── Spawn ───────────────────────────────────

    getSpawnPoint() {
        return new THREE.Vector3(0, this.floorY + 1.7, 10);
    }
}
