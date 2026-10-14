// ============================================
// CYBER::TOWER — Throwable Bouncing Ball
// F key to throw, F to catch when nearby
// Bounces off walls/floor/ceiling with physics
// Beautiful rainbow glitter trail
// ============================================

import * as THREE from 'three';
import { GRAVITY, ROOM_HEIGHT } from './constants.js';

const BALL_RADIUS = 0.36;
const THROW_SPEED = 26;
const BOUNCE_DAMPING = 0.978;
const DRAG = 0.991;
const MIN_VELOCITY = 0.15;
const CATCH_RANGE = 4.5;

// Glitter trail
const GLITTER_COUNT = 120;
const GLITTER_LIFE = 1.8;
const GLITTER_SPAWN_RATE = 0.008;

const GLITTER_COLORS = [
    new THREE.Color(0xff2d78),
    new THREE.Color(0x00d4ff),
    new THREE.Color(0x00ff88),
    new THREE.Color(0xffaa00),
    new THREE.Color(0xcc44ff),
    new THREE.Color(0xff6644),
    new THREE.Color(0x44ffcc),
];

export class Ball {
    constructor(scene) {
        this.scene = scene;
        this.colliders = [];
        this.groundLevel = 0;

        this.held = true;
        this.active = false;

        // Ball mesh
        const geo = new THREE.SphereGeometry(BALL_RADIUS, 20, 14);
        const mat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xff6600,
            emissiveIntensity: 1.2,
            roughness: 0.15,
            metalness: 0.85,
        });
        this.mesh = new THREE.Mesh(geo, mat);
        this.mesh.visible = false;
        scene.add(this.mesh);

        // Small light on ball
        this.ballLight = new THREE.PointLight(0xff8844, 0.8, 6);
        this.mesh.add(this.ballLight);

        // ── Glitter system ──
        this._gPos = new Float32Array(GLITTER_COUNT * 3);
        this._gCol = new Float32Array(GLITTER_COUNT * 3);
        this._gSize = new Float32Array(GLITTER_COUNT);
        this._gAge = new Float32Array(GLITTER_COUNT);
        this._gVel = new Float32Array(GLITTER_COUNT * 3);
        this._gAlive = new Uint8Array(GLITTER_COUNT);
        this._gAge.fill(GLITTER_LIFE + 1);
        this._gSize.fill(0);
        this._nextSpawn = 0;
        this._spawnIdx = 0;

        const gGeo = new THREE.BufferGeometry();
        gGeo.setAttribute('position', new THREE.BufferAttribute(this._gPos, 3));
        gGeo.setAttribute('color', new THREE.BufferAttribute(this._gCol, 3));

        const gMat = new THREE.PointsMaterial({
            size: 0.035,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true,
        });

        this.glitter = new THREE.Points(gGeo, gMat);
        this.glitter.visible = false;
        this.glitter.frustumCulled = false;
        scene.add(this.glitter);

        // Physics
        this.velocity = new THREE.Vector3();
        this.position = new THREE.Vector3();
        this._dir = new THREE.Vector3();
        this._ballBox = new THREE.Box3();
        this._testMin = new THREE.Vector3();
        this._testMax = new THREE.Vector3();
    }

    setColliders(c) { this.colliders = c; }
    setGroundLevel(y) { this.groundLevel = y; }

    throw(camera) {
        if (!this.held) return;
        this.held = false;
        this.active = true;

        camera.getWorldDirection(this._dir);
        this.position.copy(camera.position).addScaledVector(this._dir, 1.0);
        this.position.y -= 0.2;
        this.velocity.copy(this._dir).multiplyScalar(THROW_SPEED);

        this.mesh.position.copy(this.position);
        this.mesh.visible = true;
        this.glitter.visible = true;

        this._gAlive.fill(0);
        this._gSize.fill(0);
        this._spawnIdx = 0;
    }

    tryCatch(camera) {
        if (this.held || !this.active) return false;
        if (this.position.distanceTo(camera.position) < CATCH_RANGE) {
            this.held = true;
            this.active = false;
            this.mesh.visible = false;
            return true;
        }
        return false;
    }

    toggle(camera) {
        if (this.held) this.throw(camera);
        else this.tryCatch(camera);
    }

    update(delta) {
        this._updateGlitter(delta);
        if (!this.active) return;

        // Physics
        this.velocity.y -= GRAVITY * delta;
        this.velocity.multiplyScalar(DRAG);

        this._stepAxis('x', delta);
        this._stepAxis('y', delta);
        this._stepAxis('z', delta);

        // Floor
        if (this.position.y - BALL_RADIUS < this.groundLevel) {
            this.position.y = this.groundLevel + BALL_RADIUS;
            if (Math.abs(this.velocity.y) > MIN_VELOCITY) {
                this.velocity.y = Math.abs(this.velocity.y) * BOUNCE_DAMPING;
            } else {
                this.velocity.y = 0;
            }
            this.velocity.x *= 0.95;
            this.velocity.z *= 0.95;
        }

        // Ceiling
        if (this.position.y + BALL_RADIUS > this.groundLevel + ROOM_HEIGHT) {
            this.position.y = this.groundLevel + ROOM_HEIGHT - BALL_RADIUS;
            this.velocity.y = -Math.abs(this.velocity.y) * BOUNCE_DAMPING;
        }

        // Mesh
        this.mesh.position.copy(this.position);
        this.mesh.rotation.x += this.velocity.z * delta * 3;
        this.mesh.rotation.z -= this.velocity.x * delta * 3;

        // Cycle emissive color
        const t = performance.now() * 0.001;
        const r = Math.sin(t * 1.2) * 0.5 + 0.5;
        const g = Math.sin(t * 0.8 + 2) * 0.3 + 0.3;
        const b = Math.sin(t * 1.5 + 4) * 0.5 + 0.5;
        this.mesh.material.emissive.setRGB(r, g, b);
        this.ballLight.color.setRGB(r * 0.8 + 0.2, g * 0.8 + 0.2, b * 0.6 + 0.2);

        // Spawn glitter
        this._nextSpawn -= delta;
        if (this._nextSpawn <= 0 && this.velocity.lengthSq() > 0.5) {
            this._spawnGlitter();
            this._nextSpawn = GLITTER_SPAWN_RATE;
        }

        // Auto-stop
        if (this.position.y - BALL_RADIUS <= this.groundLevel + 0.01 &&
            this.velocity.lengthSq() < MIN_VELOCITY * MIN_VELOCITY) {
            this.velocity.set(0, 0, 0);
        }
    }

    _spawnGlitter() {
        const i = this._spawnIdx;
        this._spawnIdx = (this._spawnIdx + 1) % GLITTER_COUNT;
        const i3 = i * 3;

        this._gPos[i3]     = this.position.x + (Math.random() - 0.5) * 0.15;
        this._gPos[i3 + 1] = this.position.y + (Math.random() - 0.5) * 0.15;
        this._gPos[i3 + 2] = this.position.z + (Math.random() - 0.5) * 0.15;

        const col = GLITTER_COLORS[Math.floor(Math.random() * GLITTER_COLORS.length)];
        this._gCol[i3]     = col.r;
        this._gCol[i3 + 1] = col.g;
        this._gCol[i3 + 2] = col.b;

        this._gVel[i3]     = (Math.random() - 0.5) * 0.8;
        this._gVel[i3 + 1] = Math.random() * 0.5 + 0.2;
        this._gVel[i3 + 2] = (Math.random() - 0.5) * 0.8;

        this._gAge[i] = 0;
        this._gSize[i] = 0.08 + Math.random() * 0.1;
        this._gAlive[i] = 1;
    }

    _updateGlitter(delta) {
        let anyAlive = false;
        for (let i = 0; i < GLITTER_COUNT; i++) {
            if (!this._gAlive[i]) continue;
            anyAlive = true;
            this._gAge[i] += delta;
            if (this._gAge[i] > GLITTER_LIFE) {
                this._gAlive[i] = 0;
                this._gSize[i] = 0;
                // Move to origin so invisible
                const i3 = i * 3;
                this._gPos[i3] = 0; this._gPos[i3+1] = -100; this._gPos[i3+2] = 0;
                continue;
            }
            const i3 = i * 3;
            this._gPos[i3]     += this._gVel[i3] * delta;
            this._gPos[i3 + 1] += this._gVel[i3 + 1] * delta;
            this._gPos[i3 + 2] += this._gVel[i3 + 2] * delta;
            this._gVel[i3]     *= 0.98;
            this._gVel[i3 + 1] *= 0.98;
            this._gVel[i3 + 2] *= 0.98;

            // Fade via color brightness
            const fade = 1.0 - (this._gAge[i] / GLITTER_LIFE);
            const twinkle = 0.6 + Math.sin(this._gAge[i] * 12 + i) * 0.4;
            const f = fade * twinkle;
            const col = GLITTER_COLORS[i % GLITTER_COLORS.length];
            this._gCol[i3]     = col.r * f;
            this._gCol[i3 + 1] = col.g * f;
            this._gCol[i3 + 2] = col.b * f;
        }

        const geo = this.glitter.geometry;
        geo.attributes.position.needsUpdate = true;
        geo.attributes.color.needsUpdate = true;

        if (!anyAlive && !this.active) {
            this.glitter.visible = false;
        }
    }

    _stepAxis(axis, delta) {
        const oldVal = this.position[axis];
        this.position[axis] += this.velocity[axis] * delta;

        this._testMin.set(
            this.position.x - BALL_RADIUS,
            this.position.y - BALL_RADIUS,
            this.position.z - BALL_RADIUS
        );
        this._testMax.set(
            this.position.x + BALL_RADIUS,
            this.position.y + BALL_RADIUS,
            this.position.z + BALL_RADIUS
        );
        this._ballBox.set(this._testMin, this._testMax);

        for (let i = 0; i < this.colliders.length; i++) {
            if (this._ballBox.intersectsBox(this.colliders[i])) {
                this.position[axis] = oldVal;
                this.velocity[axis] *= -BOUNCE_DAMPING;
                for (let j = 0; j < 5; j++) this._spawnGlitter();
                return;
            }
        }
    }
}
