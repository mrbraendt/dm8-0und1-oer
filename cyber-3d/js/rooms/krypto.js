// ============================================
// CYBER::TOWER — Krypto Room (F3: KRYPTO)
// Caesar cipher, ROT13, encryption basics
// Gate: decrypt "VASBEZNGVBA" with ROT13 → "INFORMATION"
// ============================================

import * as THREE from 'three';
import { Room } from './Room.js';
import { COLORS, CSS_COLORS, ROOM_SIZE, ROOM_HEIGHT, FLOORS } from '../constants.js';
import { state } from '../state.js';
import { showNotification } from '../hud.js';
import { createElevatorPanel } from '../elevator.js';

export class KryptoRoom extends Room {
    constructor() {
        super('krypto', FLOORS.krypto.index);
    }

    build() {
        const { wallMat } = this.buildShell(COLORS.neonPink);

        this._buildEnigmaDecor();
        this._buildCipherWall();
        this._buildCaesarTerminal();
        this._buildInfoTerminal();
        this._buildElevator(wallMat);
        this._buildDecoLights();
        this._buildParticles();
        this._buildMovingPlatforms();

        return this.group;
    }

    // ── Atmosphere & Titles ─────────────────────────────

    _buildEnigmaDecor() {
        // Room title
        this.addTextPlane('F3: KRYPTO', 0, 4.5, -ROOM_SIZE / 2 + 0.6, 6, 0.8, {
            color: CSS_COLORS.neonPink, fontSize: 44,
        });
        this.addTextPlane('VERSCHLÜSSELUNG', 0, 3.8, -ROOM_SIZE / 2 + 0.6, 6, 0.4, {
            color: CSS_COLORS.dim, fontSize: 20,
        });

        // Neon strips on side walls
        const stripMat = new THREE.MeshStandardMaterial({
            color: 0x110014, emissive: COLORS.neonPink, emissiveIntensity: 0.5,
        });
        for (let i = 0; i < 4; i++) {
            const yPos = 0.6 + i * 1.1;
            const sL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 8), stripMat);
            sL.position.set(-ROOM_SIZE / 2 + 0.5, yPos, -3);
            this.group.add(sL);
            const sR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 8), stripMat);
            sR.position.set(ROOM_SIZE / 2 - 0.5, yPos, -3);
            this.group.add(sR);
        }
    }

        // ── Encrypted Message Wall ──────────────────────────

    _buildCipherWall() {
        const z = -ROOM_SIZE / 2 + 1.2;

        // Glowing display panel on north wall
        const panelMat = new THREE.MeshStandardMaterial({
            color: 0x0a000f, emissive: 0x330022, emissiveIntensity: 0.3,
            metalness: 0.3, roughness: 0.5,
        });
        this.addBox(0, 1.5, z - 0.05, 13, 3.5, 0.12, panelMat, { collider: false });

        // Pink border frame
        const borderMat = new THREE.MeshStandardMaterial({
            color: 0x110015, emissive: COLORS.neonPink, emissiveIntensity: 1.0,
        });
        this.addBox(0,  3.22, z, 13, 0.06, 0.14, borderMat, { collider: false });
        this.addBox(0, -0.22, z, 13, 0.06, 0.14, borderMat, { collider: false });
        this.addBox(-6.5, 1.5, z, 0.06, 3.5, 0.14, borderMat, { collider: false });
        this.addBox( 6.5, 1.5, z, 0.06, 3.5, 0.14, borderMat, { collider: false });

        const msgs = [
            { text: 'GEHEIMTEXT:', y: 2.8, color: CSS_COLORS.dim, size: 20 },
            { text: 'VASBEZNGVBA', y: 2.0, color: CSS_COLORS.neonPink, size: 52 },
            { text: 'METHODE: CAESAR (ROT-??)', y: 1.1, color: CSS_COLORS.dim, size: 18 },
        ];
        for (const m of msgs) {
            this.addTextPlane(m.text, 0, m.y, z + 0.05, 11, 0.7, {
                color: m.color, fontSize: m.size, fontFamily: 'Share Tech Mono',
            });
        }
    }

        // ── Caesar Terminal (main puzzle) ────────────────

    _buildCaesarTerminal() {
        const x = 0, z = 2;
        const group = new THREE.Group();

        const deskMat = new THREE.MeshStandardMaterial({
            color: 0x0c0c1a, metalness: 0.4, roughness: 0.5,
        });
        const desk = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.8, 1.2), deskMat);
        desk.position.set(x, 0.4, z);
        group.add(desk);

        const screenMat = new THREE.MeshStandardMaterial({
            color: 0x1a0a1a, emissive: COLORS.neonPink,
            emissiveIntensity: 0.5, metalness: 0.3, roughness: 0.5,
            transparent: true, opacity: 0.35,
        });
        const screen = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 0.08), screenMat);
        screen.position.set(x, 1.65, z - 0.42);
        screen.rotation.x = -0.15;
        group.add(screen);

        const glow = new THREE.PointLight(COLORS.neonPink, 1.2, 8);
        glow.position.set(x, 2.0, z);
        group.add(glow);

        this.addTextPlane('DECODER TERMINAL', x, 2.7, z - 0.3, 5, 0.4, {
            color: CSS_COLORS.neonPink, fontSize: 22,
        });
        this.addTextPlane('[E] INTERAGIEREN', x, 1.0, z - 0.3, 3, 0.3, {
            color: CSS_COLORS.dim, fontSize: 16, fontFamily: 'Share Tech Mono',
        });

        this.group.add(group);
        this.colliders.push(new THREE.Box3(
            new THREE.Vector3(x - 1.5, this.floorY, z - 0.8),
            new THREE.Vector3(x + 1.5, this.floorY + 2.2, z + 0.8)
        ));
        this.interactables.push({
            mesh: group,
            onInteract: () => this._openCaesarUI(),
        });
    }

    _openCaesarUI() {
        const content = document.getElementById('terminal-content');
        const overlay = document.getElementById('terminal-overlay');
        const cipher = 'VASBEZNGVBA';

        const decrypt = (text, shift) => text.split('').map(c =>
            (c >= 'A' && c <= 'Z')
                ? String.fromCharCode(((c.charCodeAt(0) - 65 + shift) % 26) + 65)
                : c
        ).join('');

        content.innerHTML = `
            <h2 style="margin-bottom:0.3rem">CAESAR-ENTSCHL\u00dcSSELUNG</h2>
            <p style="margin:0.2rem 0">Geheimtext:</p>
            <p style="font-size:1.3rem;color:#ff2d78;text-align:center;letter-spacing:0.2em;margin:0.3rem 0;font-family:'Share Tech Mono'">VASBEZNGVBA</p>
            <p style="color:#778899;font-size:0.8rem;margin-bottom:0.5rem">Caesar-Chiffre verschiebt Buchstaben. Welche Verschiebung ergibt ein echtes Wort?</p>
            <div style="display:flex;gap:1rem;align-items:flex-start;margin:0.4rem 0">
                <canvas id="caesar-wheel" width="160" height="160" style="border-radius:50%;background:#07070f;border:1px solid #331122;flex-shrink:0"></canvas>
                <div style="display:flex;flex-direction:column;gap:0.45rem;flex:1">
                    <button class="rot-btn" data-rot="11" style="padding:0.6rem;background:#0a0a1a;border:2px solid #ff2d78;color:#ff2d78;font-family:'Orbitron',sans-serif;font-size:0.85rem;cursor:pointer;border-radius:4px">ROT-11</button>
                    <button class="rot-btn" data-rot="12" style="padding:0.6rem;background:#0a0a1a;border:2px solid #ff2d78;color:#ff2d78;font-family:'Orbitron',sans-serif;font-size:0.85rem;cursor:pointer;border-radius:4px">ROT-12</button>
                    <button class="rot-btn" data-rot="13" style="padding:0.6rem;background:#0a0a1a;border:2px solid #ff2d78;color:#ff2d78;font-family:'Orbitron',sans-serif;font-size:0.85rem;cursor:pointer;border-radius:4px">ROT-13</button>
                    <p style="color:#556677;margin:0.3rem 0 0;font-size:0.78rem">ERGEBNIS ROT-<span id="rot-label">?</span>:</p>
                    <p id="caesar-result" style="font-size:1rem;color:#00ff88;letter-spacing:0.12em;font-family:'Share Tech Mono';margin:0;word-break:break-all">???????????</p>
                </div>
            </div>
            <div id="answer-section" style="margin-top:0.5rem">
                <label style="color:#00d4ff;font-size:0.85rem">Entschl\u00fcsseltes Wort eingeben:</label>
                <input type="text" id="caesar-answer" placeholder="Klartext..." maxlength="20"
                    autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false"
                    style="display:block;width:100%;box-sizing:border-box;margin-top:0.3rem;padding:0.4rem;background:#0a0a15;border:1px solid #ff2d78;color:#fff;font-family:'Share Tech Mono';font-size:1rem">
                <button id="caesar-check" class="terminal-btn" style="display:block;margin:0.5rem auto 0">\u00dcBERMITTELN</button>
            </div>
            <p id="caesar-feedback" style="text-align:center;margin-top:0.4rem;min-height:1.4em;font-size:0.9rem"></p>
        `;
        overlay.classList.remove('hidden');
        state.terminalOpen = true;
        state.emit('openTerminal');

        // Draw the Caesar cipher wheel on canvas
        const drawWheel = (ctx, shift) => {
            const W = 160, H = 160, cx = 80, cy = 80;
            const rO = 71, rI = 47;
            ctx.clearRect(0, 0, W, H);
            ctx.fillStyle = '#07070f'; ctx.fillRect(0, 0, W, H);
            ctx.strokeStyle = '#331133'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(cx, cy, rO, 0, Math.PI * 2); ctx.stroke();
            ctx.strokeStyle = '#220022';
            ctx.beginPath(); ctx.arc(cx, cy, rI, 0, Math.PI * 2); ctx.stroke();

            for (let i = 0; i < 26; i++) {
                const a = (i / 26) * Math.PI * 2 - Math.PI / 2;
                const ox = cx + Math.cos(a) * (rO - 9);
                const oy = cy + Math.sin(a) * (rO - 9);
                ctx.font = '8px monospace'; ctx.fillStyle = '#778899';
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(String.fromCharCode(65 + i), ox, oy);
                if (shift !== null) {
                    const j = (i + 26 - shift) % 26;
                    const a2 = (j / 26) * Math.PI * 2 - Math.PI / 2;
                    const ix = cx + Math.cos(a2) * (rI + 9);
                    const iy = cy + Math.sin(a2) * (rI + 9);
                    ctx.fillStyle = '#ff2d78';
                    ctx.fillText(String.fromCharCode(65 + i), ix, iy);
                }
            }
            ctx.strokeStyle = '#00d4ff'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(cx, 4); ctx.lineTo(cx, 13); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx-3,8); ctx.lineTo(cx,3); ctx.lineTo(cx+3,8); ctx.stroke();
            if (shift !== null) {
                ctx.fillStyle = '#556677'; ctx.font = '7px monospace';
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText('ROT-' + shift, cx, cy);
            }
        };

        const wCtx = document.getElementById('caesar-wheel').getContext('2d');
        drawWheel(wCtx, null);

        setTimeout(() => {
            document.querySelectorAll('.rot-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const shift = parseInt(btn.dataset.rot);
                    document.querySelectorAll('.rot-btn').forEach(b => {
                        b.style.background = '#0a0a1a';
                        b.style.boxShadow = 'none';
                    });
                    btn.style.background = '#1a001a';
                    btn.style.boxShadow = '0 0 12px rgba(255,45,120,0.4)';
                    document.getElementById('rot-label').textContent = shift;
                    document.getElementById('caesar-result').textContent = decrypt(cipher, shift);
                    drawWheel(wCtx, shift);
                });
            });

            const checkBtn = document.getElementById('caesar-check');
            if (checkBtn) {
                checkBtn.addEventListener('click', () => {
                    const answer = document.getElementById('caesar-answer').value.trim().toUpperCase();
                    const feedback = document.getElementById('caesar-feedback');
                    if (answer === 'INFORMATION') {
                        feedback.style.color = '#00ff88';
                        feedback.textContent = '\u2713 KORREKT! Gate freigeschaltet!';
                        state.solvePuzzle('krypto');
                        state.unlockFloor('dach');
                        showNotification('GATE DURCHBROCHEN! Aufzug zum DACH freigeschaltet.');
                    } else {
                        feedback.style.color = '#ff2d78';
                        feedback.textContent = '"' + answer + '" \u2014 falsch. Welche Verschiebung ergibt ein echtes Wort?';
                    }
                });
            }
        }, 50);
    }

        // ── Info Terminal ────────────────────────────

    _buildInfoTerminal() {
        const x = -10, z = 8;
        const group = new THREE.Group();

        const baseMat = new THREE.MeshStandardMaterial({ color: 0x0c0c1a, metalness: 0.5, roughness: 0.5 });
        const screenMat = new THREE.MeshStandardMaterial({
            color: 0x1a0a1a, emissive: COLORS.neonPink, emissiveIntensity: 0.3,
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
                    <h2>VERSCHLÜSSELUNG</h2>
                    <p>Seit Jahrtausenden schützen Menschen Geheimnisse durch <strong style="color:#ff2d78">Verschlüsselung</strong>.</p>
                    <p>Die <strong>Caesar-Chiffre</strong> ist eine der ältesten Methoden: Jeder Buchstabe wird im Alphabet um eine feste Anzahl verschoben.</p>
                    <p style="color:#00d4ff">A B C D E → (Verschiebung +3) → D E F G H</p>
                    <p><strong>ROT13</strong> ist ein Spezialfall mit Verschiebung 13. Das Besondere: ROT13 zweimal angewendet ergibt wieder den Originaltext (weil das Alphabet 26 Buchstaben hat).</p>
                    <p>Im Zweiten Weltkrieg nutzte Deutschland die <strong>Enigma-Maschine</strong> — eine komplexe Verschlüsselung mit rotierenden Walzen. <strong>Alan Turing</strong> (der auch die Turing-Maschine erfand!) knackte den Enigma-Code und half, den Krieg zu beenden.</p>
                    <p style="color:#ff2d78">Aufgabe: Entschlüssle die Nachricht "VASBEZNGVBA" mit ROT13 am Terminal.</p>
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
            color: 0x0a0a18, emissive: COLORS.neonPink, emissiveIntensity: 0.12,
            metalness: 0.5, roughness: 0.5,
        });
        this.addBox(0, doorH, ez, doorW * 2 + 0.6, 0.3, 0.4, frameMat, { collider: false });
        this.addBox(-doorW - 0.15, 0, ez, 0.3, doorH, 0.4, frameMat, { collider: false });
        this.addBox(doorW + 0.15, 0, ez, 0.3, doorH, 0.4, frameMat, { collider: false });

        const doorMat = new THREE.MeshStandardMaterial({
            color: 0x0d0d20, emissive: COLORS.neonPink, emissiveIntensity: 0.04,
            metalness: 0.7, roughness: 0.4,
        });
        this.addBox(-doorW / 2, 0, ez, doorW, doorH, 0.15, doorMat, { collider: false });
        this.addBox(doorW / 2, 0, ez, doorW, doorH, 0.15, doorMat, { collider: false });

        this.colliders.push(new THREE.Box3(
            new THREE.Vector3(-doorW - 0.2, this.floorY, ez - 0.3),
            new THREE.Vector3(doorW + 0.2, this.floorY + doorH, ez + 0.3)
        ));

        this.addNeonStrip(0, doorH + 0.35, ez, doorW * 2, 'x', COLORS.neonPink, 2.5);
        this.addTextPlane('AUFZUG', 0, doorH + 0.8, ez - 0.1, 3, 0.5, {
            color: CSS_COLORS.neonPink, fontSize: 36,
            rotY: Math.PI,
        });

        const panel = createElevatorPanel(THREE, this, doorW + 0.5, 1.3, ez - 0.15, state.unlockedFloors, Math.PI);
        this.interactables.push(panel);
    }

    // ── Atmosphere ──────────────────────────────

    _buildDecoLights() {
        this.addLight(0, 4, 0, COLORS.neonPink, 1.0, 18);
        this.addLight(-8, 2, -10, COLORS.neonPink, 0.5, 10);
        this.addLight(8, 2, 5, COLORS.neonPink, 0.5, 10);
        // Blue accent for contrast
        this.addLight(10, 3, -8, COLORS.neonBlue, 0.3, 8);
    }

    _buildParticles() {
        // Pink glitch particles
        const count = 100;
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        const S = ROOM_SIZE / 2 - 1;

        for (let i = 0; i < count; i++) {
            positions[i * 3]     = (Math.random() - 0.5) * S * 2;
            positions[i * 3 + 1] = Math.random() * ROOM_HEIGHT;
            positions[i * 3 + 2] = (Math.random() - 0.5) * S * 2;
            velocities[i * 3]     = (Math.random() - 0.5) * 0.5;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.PointsMaterial({
            color: COLORS.neonPink, size: 0.06,
            transparent: true, opacity: 0.6,
            blending: THREE.AdditiveBlending, depthWrite: false,
        });

        this.group.add(new THREE.Points(geo, mat));

        this.animatedObjects.push({
            update(delta) {
                const pos = geo.attributes.position.array;
                for (let i = 0; i < pos.length; i += 3) {
                    pos[i]     += velocities[i] * delta;
                    pos[i + 1] += velocities[i + 1] * delta;
                    pos[i + 2] += velocities[i + 2] * delta;
                    // Bounce
                    if (Math.abs(pos[i]) > S) velocities[i] *= -1;
                    if (pos[i + 1] < 0 || pos[i + 1] > ROOM_HEIGHT) velocities[i + 1] *= -1;
                    if (Math.abs(pos[i + 2]) > S) velocities[i + 2] *= -1;
                }
                geo.attributes.position.needsUpdate = true;
            }
        });
    }

    // ── Moving Platforms ─────────────────────────

    _buildMovingPlatforms() {
        const pMat = new THREE.MeshStandardMaterial({
            color: 0x11000d, emissive: COLORS.neonPink, emissiveIntensity: 0.4,
            metalness: 0.7, roughness: 0.3,
        });
        this.addMovingPlatform(-6, 1.4,  0, 2.4, 0.22, 1.2, 'z', 4.5, 0.7, pMat);
        this.addMovingPlatform( 5, 2.0, -3, 2.2, 0.22, 1.0, 'x', 4.0, 0.9, pMat);
    }

    getSpawnPoint() {
        return new THREE.Vector3(0, this.floorY + 1.7, 10);
    }
}
