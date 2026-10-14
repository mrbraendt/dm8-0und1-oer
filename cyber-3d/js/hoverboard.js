// ============================================
// CYBER::TOWER — Hoverboard System
// Mount with E, fly everywhere, SPACE=up SHIFT=down
// ============================================

import * as THREE from 'three';
import { showNotification } from './hud.js';

const HSPEED = 24;   // horizontal speed while flying (m/s)
const VSPEED = 10;   // vertical speed (m/s)
const BOB_FREQ = 2;  // idle bob frequency

export class Hoverboard {
    constructor(scene) {
        this.scene = scene;
        this.mounted = false;
        this._mountLockUntil = 0;
        this._bobTimer = 0;
        this._homeY = 0.35;
        this._fwd   = new THREE.Vector3();
        this._right = new THREE.Vector3();
        this._up    = new THREE.Vector3(0, 1, 0);

        this.mesh = this._buildMesh();
        scene.add(this.mesh);
    }

    // ── Visual ────────────────────────────────────

    _buildMesh() {
        const group = new THREE.Group();

        // Main board body
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x002233, emissive: 0x00d4ff, emissiveIntensity: 0.6,
            metalness: 0.9, roughness: 0.15,
        });
        const board = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.6), bodyMat);
        group.add(board);

        // Glowing edge rails
        const railMat = new THREE.MeshStandardMaterial({
            color: 0x003344, emissive: 0x00ffcc, emissiveIntensity: 3,
        });
        for (const ez of [-0.31, 0.31]) {
            const rail = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 0.04), railMat);
            rail.position.set(0, -0.02, ez);
            group.add(rail);
        }
        for (const ex of [-0.82, 0.82]) {
            const cap = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.6), railMat);
            cap.position.set(ex, -0.02, 0);
            group.add(cap);
        }

        // Thruster pods (4 corners)
        const thrustMat = new THREE.MeshStandardMaterial({
            color: 0x001111, emissive: 0x00ff88, emissiveIntensity: 4,
        });
        for (const tx of [-0.6, 0.6]) {
            for (const tz of [-0.22, 0.22]) {
                const t = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.09, 0.08, 8), thrustMat);
                t.position.set(tx, -0.06, tz);
                group.add(t);
                // Thruster glow
                const gl = new THREE.PointLight(0x00ff88, 0.8, 2);
                gl.position.set(tx, -0.2, tz);
                group.add(gl);
            }
        }

        // Hover glow beneath board
        const hoverGlow = new THREE.PointLight(0x00d4ff, 2, 5);
        hoverGlow.position.y = -0.6;
        group.add(hoverGlow);

        return group;
    }

    /** Place the board at a specific world position (called from dach.js) */
    place(x, y, z) {
        this.mesh.position.set(x, y, z);
        this._homeY = y;
    }

    // ── Mount / Dismount ──────────────────────────

    /** Called when player presses E near the board */
    mount() {
        if (this.mounted) return;
        this.mounted = true;
        this._mountLockUntil = performance.now() + 350;
        this.mesh.visible = false; // board "under feet" — invisible while riding
        showNotification('🏄 HOVERBOARD AKTIV — WASD fliegen · SPACE hoch · C runter · [E] absteigen');
    }

    /** Called when player presses E while mounted, or exits dach */
    dismount(camera) {
        if (!this.mounted) return false;
        if (performance.now() < this._mountLockUntil) return false;
        this.mounted = false;
        // Park board under camera
        this.mesh.position.set(camera.position.x, camera.position.y - 1.6, camera.position.z);
        this._homeY = this.mesh.position.y;
        this.mesh.visible = true;
        return true;
    }

    // ── Update ────────────────────────────────────

    /**
     * @param {number} delta
     * @param {{ forward: number, right: number }} input
     * @param {THREE.Camera} camera
     * @param {Record<string, boolean>} heldKeys  — live key state map
     */
    update(delta, input, camera, heldKeys) {
        if (!this.mounted) {
            // Idle bob animation while parked
            this._bobTimer += delta;
            this.mesh.position.y = this._homeY + Math.sin(this._bobTimer * BOB_FREQ) * 0.06;
            return;
        }

        // Camera forward projected to XZ plane
        camera.getWorldDirection(this._fwd);
        this._fwd.y = 0;
        if (this._fwd.lengthSq() < 0.001) this._fwd.set(0, 0, -1);
        this._fwd.normalize();
        this._right.crossVectors(this._fwd, this._up).normalize();

        // Horizontal movement
        const move = new THREE.Vector3();
        move.addScaledVector(this._fwd,  input.forward);
        move.addScaledVector(this._right, input.right);
        if (move.lengthSq() > 0) move.normalize().multiplyScalar(HSPEED * delta);
        camera.position.add(move);

        // Vertical
        if (heldKeys['Space']) camera.position.y += VSPEED * delta;
        if (heldKeys['KeyC']) camera.position.y -= VSPEED * delta;

        // Clamp — don't go below roof floor
        camera.position.y = Math.max(camera.position.y, 1.7);
    }
}
