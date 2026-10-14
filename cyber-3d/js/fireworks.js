// ============================================
// CYBER::TOWER — Fireworks System
// Launch colorful rocket bursts into the sky
// ============================================

import * as THREE from 'three';

const BURST_COLORS = [
    0xff2d78, 0x00d4ff, 0x00ff88, 0xffaa00,
    0xcc44ff, 0xff6644, 0x44ffcc, 0xffeedd,
    0xff88cc, 0x88ffff,
];

// ── Single Rocket ────────────────────────────────

class Rocket {
    constructor(scene, x, y, z) {
        this.scene = scene;
        this.lifetime = 0;
        this.fuseTime = 1.1 + Math.random() * 1.2;
        this.color = BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)];
        this.vel = new THREE.Vector3(
            (Math.random() - 0.5) * 6,
            16 + Math.random() * 10,
            (Math.random() - 0.5) * 6
        );

        const mat = new THREE.MeshStandardMaterial({
            color: 0xffcc00, emissive: 0xffaa00, emissiveIntensity: 5,
        });
        this.mesh = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 4), mat);
        this.mesh.position.set(x, y, z);
        scene.add(this.mesh);

        this.light = new THREE.PointLight(0xffbb00, 3, 10);
        this.light.position.copy(this.mesh.position);
        scene.add(this.light);
    }

    update(delta) {
        this.lifetime += delta;
        this.vel.y -= 4 * delta; // arc
        this.mesh.position.addScaledVector(this.vel, delta);
        this.light.position.copy(this.mesh.position);
        return this.lifetime < this.fuseTime;
    }

    dispose() {
        this.scene.remove(this.mesh);
        this.scene.remove(this.light);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}

// ── Explosion (burst particle cloud) ─────────────

class Explosion {
    constructor(scene, origin, color) {
        this.scene = scene;
        this.color = color;
        this.lifetime = 0;
        this.maxLife = 2.5;

        // Main burst — 120 particles
        const COUNT = 120;
        const pos = new Float32Array(COUNT * 3);
        this.vels = [];
        for (let i = 0; i < COUNT; i++) {
            pos[i * 3]     = origin.x;
            pos[i * 3 + 1] = origin.y;
            pos[i * 3 + 2] = origin.z;
            const theta = Math.random() * Math.PI * 2;
            const phi   = Math.acos(2 * Math.random() - 1);
            const r     = 5 + Math.random() * 8;
            this.vels.push(new THREE.Vector3(
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.sin(phi) * Math.sin(theta),
                r * Math.cos(phi)
            ));
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({
            color, size: 0.25, transparent: true, opacity: 1,
            blending: THREE.AdditiveBlending, depthWrite: false,
        });
        this.points = new THREE.Points(geo, mat);
        scene.add(this.points);
        this.geo = geo; this.mat = mat;

        // Sparkle ring — secondary color
        const S2 = 50;
        const pos2 = new Float32Array(S2 * 3);
        this.vels2 = [];
        for (let i = 0; i < S2; i++) {
            pos2[i * 3] = origin.x; pos2[i * 3 + 1] = origin.y; pos2[i * 3 + 2] = origin.z;
            // Ring pattern — expand outward on XZ plane
            const a = (i / S2) * Math.PI * 2;
            const r = 6 + Math.random() * 3;
            this.vels2.push(new THREE.Vector3(Math.cos(a) * r, (Math.random() - 0.2) * 4, Math.sin(a) * r));
        }
        const geo2 = new THREE.BufferGeometry();
        geo2.setAttribute('position', new THREE.BufferAttribute(pos2, 3));
        const mat2 = new THREE.PointsMaterial({
            color: 0xffffff, size: 0.15, transparent: true, opacity: 0.9,
            blending: THREE.AdditiveBlending, depthWrite: false,
        });
        this.points2 = new THREE.Points(geo2, mat2);
        scene.add(this.points2);
        this.geo2 = geo2; this.mat2 = mat2;

        // Bright flash light
        this.light = new THREE.PointLight(color, 15, 40);
        this.light.position.copy(origin);
        scene.add(this.light);
    }

    update(delta) {
        this.lifetime += delta;
        const t = this.lifetime;
        const p  = this.geo.attributes.position.array;
        const p2 = this.geo2.attributes.position.array;

        for (let i = 0; i < this.vels.length; i++) {
            const v = this.vels[i];
            p[i * 3]     += v.x * delta;
            p[i * 3 + 1] += v.y * delta;
            p[i * 3 + 2] += v.z * delta;
            v.multiplyScalar(0.95);
            v.y -= 3 * delta; // gravity
        }
        for (let i = 0; i < this.vels2.length; i++) {
            const v = this.vels2[i];
            p2[i * 3]     += v.x * delta;
            p2[i * 3 + 1] += v.y * delta;
            p2[i * 3 + 2] += v.z * delta;
            v.multiplyScalar(0.93);
        }
        this.geo.attributes.position.needsUpdate  = true;
        this.geo2.attributes.position.needsUpdate = true;

        const fade = Math.max(0, 1 - t / this.maxLife);
        this.mat.opacity  = fade;
        this.mat2.opacity = fade * 0.9;
        this.light.intensity = Math.max(0, 15 * (1 - t / 0.5));

        return t < this.maxLife;
    }

    dispose() {
        this.scene.remove(this.points);
        this.scene.remove(this.points2);
        this.scene.remove(this.light);
        this.geo.dispose();  this.mat.dispose();
        this.geo2.dispose(); this.mat2.dispose();
    }
}

// ── Public Fireworks Manager ─────────────────────

export class Fireworks {
    constructor(scene) {
        this.scene = scene;
        this.rockets    = [];
        this.explosions = [];
        this.autoMode   = false;
        this.autoTimer  = 0;
        this.ox = 0; this.oy = 1; this.oz = 0; // launch origin
    }

    setOrigin(x, y, z) { this.ox = x; this.oy = y; this.oz = z; }

    /** Launch a salvo of `count` rockets with slight delays */
    launch(count = 5) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const x = this.ox + (Math.random() - 0.5) * 12;
                const z = this.oz + (Math.random() - 0.5) * 12;
                this.rockets.push(new Rocket(this.scene, x, this.oy, z));
            }, i * 140);
        }
    }

    /** Continuously launch every ~0.8s */
    startAuto() { this.autoMode = true; this.autoTimer = 0; }
    stopAuto()  { this.autoMode = false; }

    update(delta) {
        if (this.autoMode) {
            this.autoTimer -= delta;
            if (this.autoTimer <= 0) {
                this.launch(2 + Math.floor(Math.random() * 2));
                this.autoTimer = 0.6 + Math.random() * 0.6;
            }
        }

        // Rockets → explosions
        for (let i = this.rockets.length - 1; i >= 0; i--) {
            const r = this.rockets[i];
            if (!r.update(delta)) {
                this.explosions.push(new Explosion(this.scene, r.mesh.position.clone(), r.color));
                r.dispose();
                this.rockets.splice(i, 1);
            }
        }

        // Fade explosions
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            if (!this.explosions[i].update(delta)) {
                this.explosions[i].dispose();
                this.explosions.splice(i, 1);
            }
        }
    }
}
