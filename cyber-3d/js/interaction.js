// ============================================
// CYBER::TOWER — Interaction System
// Raycaster-based object interaction
// ============================================

import * as THREE from 'three';
import { playClick } from './audio.js';

export class InteractionSystem {
    constructor(camera, state) {
        this.camera = camera;
        this.state = state;
        this.raycaster = new THREE.Raycaster();
        this.raycaster.far = 4.5;
        this.center = new THREE.Vector2(0, 0);
        this.interactables = [];   // { mesh, onInteract, id }
        this.currentTarget = null;

        this._promptEl = document.getElementById('hud-interact');

        // Desktop: E key
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyE' && !state.terminalOpen) this._doInteract();
        });

        // Touch: interact button
        state.on('interact', () => {
            if (!state.terminalOpen) this._doInteract();
        });
    }

    /**
     * Register a mesh (or Group) as interactable.
     * callback() is called when the player presses E while looking at it.
     */
    register(mesh, callback) {
        const id = this.interactables.length;
        mesh.userData.interactId = id;
        mesh.traverse(child => { child.userData.interactId = id; });
        this.interactables.push({ mesh, onInteract: callback, id });
    }

    /** Remove all registered interactables (when switching rooms). */
    clear() {
        this.interactables = [];
        this.currentTarget = null;
        this._promptEl.classList.add('hidden');
    }

    /** Call every frame to update raycaster and HUD prompt. */
    update() {
        if (this.state.paused || this.state.terminalOpen || this.interactables.length === 0) {
            this._promptEl.classList.add('hidden');
            this.currentTarget = null;
            return;
        }

        this.raycaster.setFromCamera(this.center, this.camera);

        // Collect all meshes from interactable groups
        const meshes = [];
        for (const item of this.interactables) {
            item.mesh.traverse(child => {
                if (child.isMesh) meshes.push(child);
            });
        }

        const hits = this.raycaster.intersectObjects(meshes, false);

        if (hits.length > 0) {
            const hitId = hits[0].object.userData.interactId;
            if (hitId !== undefined) {
                this.currentTarget = this.interactables[hitId];
                this._promptEl.classList.remove('hidden');
                return;
            }
        }

        this.currentTarget = null;
        this._promptEl.classList.add('hidden');
    }

    _doInteract() {
        if (this.currentTarget) {
            playClick();
            this.currentTarget.onInteract();
        }
    }
}
