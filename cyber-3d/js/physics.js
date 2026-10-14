// ============================================
// CYBER::TOWER — Simple Physics
// Sphere vs AABB collision, gravity, ground
// ============================================

import * as THREE from 'three';
import { PLAYER_HEIGHT, PLAYER_RADIUS, MOVE_SPEED, GRAVITY, JUMP_SPEED } from './constants.js';

export class Physics {
    constructor(camera) {
        this.camera = camera;
        this.colliders = [];      // THREE.Box3[] in world space
        this.groundLevel = 0;     // Y of the current floor surface
        this.movingPlatforms = []; // { box3 } — updated each frame by Room
        this.velocityY = 0;
        this.onGround = true;

        // Reusable vectors
        this._fwd = new THREE.Vector3();
        this._right = new THREE.Vector3();
        this._move = new THREE.Vector3();
        this._testPos = new THREE.Vector3();
        this._playerMin = new THREE.Vector3();
        this._playerMax = new THREE.Vector3();
        this._testBox = new THREE.Box3();
    }

    setColliders(colliders) {
        this.colliders = colliders;
    }

    setGroundLevel(y) {
        this.groundLevel = y;
    }

    setMovingPlatforms(platforms) {
        this.movingPlatforms = platforms || [];
    }

    jump() {
        if (this.onGround) {
            this.velocityY = JUMP_SPEED;
            this.onGround = false;
        }
    }

    update(moveInput, delta) {
        const cam = this.camera;

        // Get camera forward direction on XZ plane
        cam.getWorldDirection(this._fwd);
        this._fwd.y = 0;
        this._fwd.normalize();

        // Right vector
        this._right.crossVectors(this._fwd, cam.up).normalize();

        // Desired movement
        this._move.set(0, 0, 0);
        this._move.addScaledVector(this._fwd, moveInput.forward);
        this._move.addScaledVector(this._right, moveInput.right);
        if (this._move.lengthSq() > 0) {
            this._move.normalize().multiplyScalar(MOVE_SPEED * delta);
        }

        // Try X movement
        this._testPos.copy(cam.position);
        this._testPos.x += this._move.x;
        if (!this._collides(this._testPos)) {
            cam.position.x = this._testPos.x;
        }

        // Try Z movement
        this._testPos.copy(cam.position);
        this._testPos.z += this._move.z;
        if (!this._collides(this._testPos)) {
            cam.position.z = this._testPos.z;
        }

        // Gravity
        this.velocityY -= GRAVITY * delta;
        cam.position.y += this.velocityY * delta;

        // Ground — check static floor AND any moving platform surfaces
        let effectiveGround = this.groundLevel;
        if (this.movingPlatforms.length > 0) {
            const px = cam.position.x, pz = cam.position.z;
            for (const plat of this.movingPlatforms) {
                const b = plat.box3;
                // Player must be horizontally within the platform footprint
                if (px >= b.min.x - 0.4 && px <= b.max.x + 0.4 &&
                    pz >= b.min.z - 0.4 && pz <= b.max.z + 0.4) {
                    // Only use as floor if player is above or at the platform top
                    if (cam.position.y - PLAYER_HEIGHT >= b.max.y - 0.3) {
                        effectiveGround = Math.max(effectiveGround, b.max.y);
                    }
                }
            }
        }
        const floorY = effectiveGround + PLAYER_HEIGHT;
        if (cam.position.y <= floorY) {
            cam.position.y = floorY;
            this.velocityY = 0;
            this.onGround = true;
        } else {
            this.onGround = (cam.position.y <= effectiveGround + PLAYER_HEIGHT + 0.05);
        }
    }

    _collides(pos) {
        this._playerMin.set(
            pos.x - PLAYER_RADIUS,
            pos.y - PLAYER_HEIGHT,
            pos.z - PLAYER_RADIUS
        );
        this._playerMax.set(
            pos.x + PLAYER_RADIUS,
            pos.y + 0.1,
            pos.z + PLAYER_RADIUS
        );
        this._testBox.set(this._playerMin, this._playerMax);

        for (let i = 0; i < this.colliders.length; i++) {
            if (this._testBox.intersectsBox(this.colliders[i])) {
                return true;
            }
        }
        return false;
    }
}
