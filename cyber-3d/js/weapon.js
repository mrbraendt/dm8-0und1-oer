// ============================================
// CYBER::TOWER — Laser Weapon + Drone Enemies
// Activated via the DATENKERN in the secret room
// Left-click to fire infinite laser beams
// Drones swarm from the sky, explode when hit
// ============================================

import * as THREE from 'three';
import { showNotification } from './hud.js';

const LASER_COLOR   = 0x00ffff;
const LASER_SPEED   = 65;     // m/s
const LASER_RANGE   = 50;     // m before despawn
const LASER_RATE    = 0.08;   // min seconds between shots (rapid fire)
const DRONE_SPEED   = 5.5;
const DRONE_SPAWN_T = 3.2;    // seconds between spawns
const MAX_DRONES    = 10;
const HIT_RADIUS    = 0.6;    // laser → drone collision radius

const DRONE_COLORS = [0xff3300, 0xff7700, 0xff0055, 0xdd2200];

// ── Drone ─────────────────────────────────────

class Drone {
    constructor(scene, playerPos) {
        this.scene = scene;
        this.alive = true;
        this.color = DRONE_COLORS[Math.floor(Math.random() * DRONE_COLORS.length)];
        this._wobble = Math.random() * Math.PI * 2;
        this.vel = new THREE.Vector3();

        const group = new THREE.Group();

        // Body
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x111111, emissive: this.color, emissiveIntensity: 0.7,
            metalness: 0.8, roughness: 0.2,
        });
        group.add(new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), bodyMat));

        // Wings (2 flat panels)
        const wingMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a, emissive: this.color, emissiveIntensity: 0.3,
            metalness: 0.6, roughness: 0.4, transparent: true, opacity: 0.9,
        });
        for (const sx of [-1, 1]) {
            const wing = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.28), wingMat);
            wing.position.x = sx * 0.4;
            group.add(wing);
        }

        // Red eye
        const eyeMat = new THREE.MeshStandardMaterial({
            color: this.color, emissive: this.color, emissiveIntensity: 6,
        });
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 4), eyeMat);
        eye.position.z = 0.27;
        group.add(eye);

        // Glow light
        group.add(new THREE.PointLight(this.color, 1.8, 7));

        // Spawn far above + around player
        const angle = Math.random() * Math.PI * 2;
        const dist  = 22 + Math.random() * 14;
        const h     = 10 + Math.random() * 14;
        group.position.set(
            playerPos.x + Math.cos(angle) * dist,
            playerPos.y + h,
            playerPos.z + Math.sin(angle) * dist
        );

        scene.add(group);
        this.mesh = group;
    }

    update(delta, playerPos) {
        this._wobble += delta * 3.5;
        const dir = playerPos.clone().sub(this.mesh.position);
        const dist = dir.length();
        dir.normalize();

        this.vel.lerp(dir.multiplyScalar(DRONE_SPEED), delta * 2.5);
        this.mesh.position.addScaledVector(this.vel, delta);
        this.mesh.position.y += Math.sin(this._wobble) * 0.012;

        // Face player
        this.mesh.lookAt(playerPos);

        // Wing flap
        const wings = [this.mesh.children[1], this.mesh.children[2]];
        wings.forEach((w, i) => {
            if (w) w.rotation.z = Math.sin(this._wobble * 2.4 + i * Math.PI) * 0.35;
        });

        return dist; // distance to player
    }

    explode() {
        const center = this.mesh.position.clone();
        this.scene.remove(this.mesh);

        // Particle burst
        const COUNT = 35;
        const pos = new Float32Array(COUNT * 3);
        const vels = [];
        for (let i = 0; i < COUNT; i++) {
            pos[i * 3] = center.x; pos[i * 3 + 1] = center.y; pos[i * 3 + 2] = center.z;
            vels.push(new THREE.Vector3(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8
            ));
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({
            color: this.color, size: 0.18,
            transparent: true, opacity: 1,
            blending: THREE.AdditiveBlending, depthWrite: false,
        });
        const pts  = new THREE.Points(geo, mat);
        const glow = new THREE.PointLight(this.color, 8, 12);
        glow.position.copy(center);
        this.scene.add(pts);
        this.scene.add(glow);

        let t = 0;
        const fade = () => {
            t += 0.018;
            const p = geo.attributes.position.array;
            for (let i = 0; i < vels.length; i++) {
                p[i * 3]     += vels[i].x * 0.018;
                p[i * 3 + 1] += vels[i].y * 0.018;
                p[i * 3 + 2] += vels[i].z * 0.018;
            }
            geo.attributes.position.needsUpdate = true;
            mat.opacity = Math.max(0, 1 - t / 0.6);
            glow.intensity = Math.max(0, 8 * (1 - t / 0.4));
            if (t < 0.6) requestAnimationFrame(fade);
            else { this.scene.remove(pts); this.scene.remove(glow); geo.dispose(); mat.dispose(); }
        };
        requestAnimationFrame(fade);
    }
}

// ── Laser bolt ────────────────────────────────

class Laser {
    constructor(scene, pos, dir) {
        this.scene  = scene;
        this.dir    = dir.clone().normalize();
        this.dist   = 0;

        const mat = new THREE.MeshStandardMaterial({
            color: LASER_COLOR, emissive: LASER_COLOR, emissiveIntensity: 8,
            transparent: true, opacity: 0.92,
        });
        // Cylinder aligned along Y by default — rotate to match direction
        const geo = new THREE.CylinderGeometry(0.022, 0.022, 1.4, 6);
        this.mesh = new THREE.Mesh(geo, mat);
        this.mesh.position.copy(pos);
        const quat = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 1, 0), this.dir
        );
        this.mesh.setRotationFromQuaternion(quat);
        scene.add(this.mesh);

        this.glow = new THREE.PointLight(LASER_COLOR, 3, 7);
        this.glow.position.copy(pos);
        scene.add(this.glow);
    }

    update(delta) {
        const step = LASER_SPEED * delta;
        this.mesh.position.addScaledVector(this.dir, step);
        this.glow.position.copy(this.mesh.position);
        this.dist += step;
        return this.dist < LASER_RANGE;
    }

    dispose() {
        this.scene.remove(this.mesh);
        this.scene.remove(this.glow);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}

// ── Public WeaponSystem ───────────────────────

export class WeaponSystem {
    constructor(scene) {
        this.scene  = scene;
        this.active = false;
        this.drones = [];
        this.lasers = [];
        this.spawnTimer  = 0;
        this.shotTimer   = 0;
        this.dronesKilled = 0;
        this._playerPos  = new THREE.Vector3();
        this._viewModel = null;
        this._vmBobT = 0;
        this._vmRecoil = 0;
    }

    /** Arm the weapon — called once on Datenkern interaction */
    activate() {
        if (this.active) return;
        this.active = true;
        this.spawnTimer = 1.5; // first drone after 1.5s
        showNotification('⚡ LASER-WAFFE AKTIVIERT — Linksklick schießen! Drohnen kommen…');
        this._showHUD();
    }

    _showHUD() {
        if (document.getElementById('weapon-hud')) return;
        const hud = document.createElement('div');
        hud.id = 'weapon-hud';
        hud.style.cssText = `
            position:fixed;bottom:90px;right:44px;
            color:#00ffff;font-family:'Orbitron',monospace;
            font-size:0.72rem;text-align:right;
            pointer-events:none;text-shadow:0 0 8px #00ffff;
            line-height:1.6;
        `;
        hud.innerHTML = `
            <div style="font-size:2rem;letter-spacing:-0.05em">╒══╡▶</div>
            <div>∞ LASER</div>
            <div id="drone-kill-count">ABGESCHOSSEN: 0</div>
        `;
        document.body.appendChild(hud);
    }

    _ensureViewModel(camera) {
        if (this._viewModel) return;

        const group = new THREE.Group();

        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x0a1522,
            emissive: 0x00bbee,
            emissiveIntensity: 0.45,
            metalness: 0.85,
            roughness: 0.25,
            depthTest: false,
        });
        const coreMat = new THREE.MeshStandardMaterial({
            color: 0x00141c,
            emissive: 0x00ffff,
            emissiveIntensity: 2.4,
            metalness: 0.55,
            roughness: 0.35,
            depthTest: false,
        });
        const gripMat = new THREE.MeshStandardMaterial({
            color: 0x0d0d14,
            emissive: 0x004455,
            emissiveIntensity: 0.25,
            metalness: 0.6,
            roughness: 0.5,
            depthTest: false,
        });

        // Simple but punchy sci-fi sidearm silhouette
        const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.95), bodyMat);
        barrel.position.set(0.0, 0.02, -0.44);
        group.add(barrel);

        const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.55), coreMat);
        topRail.position.set(0.0, 0.095, -0.36);
        group.add(topRail);

        const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.05, 0.11, 10), coreMat);
        muzzle.rotation.x = Math.PI / 2;
        muzzle.position.set(0.0, 0.015, -0.93);
        group.add(muzzle);

        const energyTube = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.62, 8), coreMat);
        energyTube.rotation.x = Math.PI / 2;
        energyTube.position.set(0.0, -0.05, -0.48);
        group.add(energyTube);

        const grip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.26, 0.16), gripMat);
        grip.position.set(0.0, -0.16, -0.1);
        grip.rotation.x = -0.25;
        group.add(grip);

        const finL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.14, 0.36), bodyMat);
        finL.position.set(-0.09, 0.03, -0.42);
        group.add(finL);
        const finR = finL.clone();
        finR.position.x = 0.09;
        group.add(finR);

        const glow = new THREE.PointLight(0x00e5ff, 0.7, 1.8);
        glow.position.set(0.0, 0.02, -0.85);
        group.add(glow);

        group.position.set(0.24, -0.2, -0.36);
        group.rotation.set(-0.08, -0.22, 0.01);

        group.traverse(obj => {
            if (obj.isMesh) {
                obj.renderOrder = 999;
                obj.frustumCulled = false;
            }
        });

        camera.add(group);
        this._viewModel = group;
    }

    /** Called on mousedown (left click) */
    tryFire(camera) {
        if (!this.active || this.shotTimer > 0) return;
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        const origin = camera.position.clone().addScaledVector(dir, 0.6);
        origin.y -= 0.15;
        this.lasers.push(new Laser(this.scene, origin, dir));
        this.shotTimer = LASER_RATE;
        this._vmRecoil = Math.min(1, this._vmRecoil + 0.7);
    }

    update(delta, camera) {
        if (!this.active) return;

        this._ensureViewModel(camera);

        this._playerPos.copy(camera.position);
        this.shotTimer = Math.max(0, this.shotTimer - delta);

        if (this._viewModel) {
            this._vmBobT += delta * 8;
            this._vmRecoil = Math.max(0, this._vmRecoil - delta * 7.5);
            const bob = Math.sin(this._vmBobT) * 0.008;
            this._viewModel.position.set(
                0.24,
                -0.2 + bob,
                -0.36 + this._vmRecoil * 0.08
            );
            this._viewModel.rotation.set(
                -0.08 + this._vmRecoil * 0.05,
                -0.22,
                0.01 + this._vmRecoil * 0.03
            );
        }

        // Spawn drones
        this.spawnTimer -= delta;
        if (this.spawnTimer <= 0 && this.drones.length < MAX_DRONES) {
            this.drones.push(new Drone(this.scene, this._playerPos));
            this.spawnTimer = Math.max(1.5, DRONE_SPAWN_T - this.dronesKilled * 0.08);
        }

        // Update lasers + hit detection
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            const l = this.lasers[i];
            if (!l.update(delta)) {
                l.dispose();
                this.lasers.splice(i, 1);
                continue;
            }
            // Check hits
            let hit = false;
            for (let j = this.drones.length - 1; j >= 0; j--) {
                const d = this.drones[j];
                if (l.mesh.position.distanceTo(d.mesh.position) < HIT_RADIUS) {
                    d.explode();
                    this.drones.splice(j, 1);
                    this.dronesKilled++;
                    this._updateKillCount();
                    hit = true;
                    break;
                }
            }
            if (hit) {
                l.dispose();
                this.lasers.splice(i, 1);
            }
        }

        // Update drones
        for (let i = this.drones.length - 1; i >= 0; i--) {
            const dist = this.drones[i].update(delta, this._playerPos);
            if (dist < 1.3) {
                // Reached player — self destruct with message
                this.drones[i].explode();
                this.drones.splice(i, 1);
                showNotification(`💥 Drohneneinschlag! (${this.dronesKilled} abgeschossen)`);
            }
        }
    }

    _updateKillCount() {
        const el = document.getElementById('drone-kill-count');
        if (el) el.textContent = `ABGESCHOSSEN: ${this.dronesKilled}`;
    }
}
