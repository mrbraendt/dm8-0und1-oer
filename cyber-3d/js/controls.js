// ============================================
// CYBER::TOWER — FPS Controls
// Desktop: PointerLock + WASD
// Touch:   Dual virtual joysticks
// ============================================

import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

export class GameControls {
    constructor(camera, renderer, state) {
        this.camera = camera;
        this.state = state;
        this.isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        this.moveInput = { forward: 0, right: 0 };
        this.isActive = false;
        this.pointerLock = null;

        if (this.isTouch) {
            this._initTouch();
        } else {
            this._initDesktop(camera, renderer);
        }
    }

    // ── Desktop Controls ──

    _initDesktop(camera, renderer) {
        this.pointerLock = new PointerLockControls(camera, renderer.domElement);
        this.keys = {};

        this._onKeyDown = (e) => {
            // Don't track game keys when text input is focused (terminal typing)
            const activeEl = document.activeElement;
            const isTextInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');
            
            if (!isTextInput) {
                this.keys[e.code] = true;
                if (['KeyW','KeyA','KeyS','KeyD','KeyE','KeyC','Space'].includes(e.code)) {
                    e.preventDefault();
                }
            }
        };
        this._onKeyUp = (e) => { this.keys[e.code] = false; };
        document.addEventListener('keydown', this._onKeyDown);
        document.addEventListener('keyup', this._onKeyUp);

        const blocker = document.getElementById('blocker');
        blocker.addEventListener('click', () => this.lock());

        this.pointerLock.addEventListener('lock', () => {
            this.isActive = true;
            blocker.classList.add('hidden');
            document.getElementById('hud').classList.remove('hidden');
            document.getElementById('crosshair').classList.remove('hidden');
            this.state.paused = false;
            if (!this.state.startTime) this.state.startTime = performance.now();
        });

        this.pointerLock.addEventListener('unlock', () => {
            this.isActive = false;
            if (!this.state.terminalOpen) {
                blocker.classList.remove('hidden');
                document.getElementById('hud').classList.add('hidden');
                document.getElementById('crosshair').classList.add('hidden');
                this.state.paused = true;
            }
        });
    }

    // ── Touch Controls ──

    _initTouch() {
        const blocker = document.getElementById('blocker');
        const touchUI = document.getElementById('touch-controls');

        // Swap control hints for touch
        const info = document.getElementById('controls-info');
        if (info) {
            info.innerHTML =
                '<div class="control-row">LINKS: Bewegen · RECHTS: Umsehen</div>' +
                '<div class="control-row">E-Button: Interagieren</div>';
        }

        blocker.addEventListener('click', () => {
            this.isActive = true;
            blocker.classList.add('hidden');
            touchUI.classList.remove('hidden');
            document.getElementById('hud').classList.remove('hidden');
            document.getElementById('crosshair').classList.remove('hidden');
            this.state.paused = false;
            if (!this.state.startTime) this.state.startTime = performance.now();
        });

        // Left joystick → movement
        this._initJoystick('joystick-left', (dx, dy) => {
            this.moveInput.right = dx;
            this.moveInput.forward = -dy;
        });

        // Right joystick → camera
        this._initJoystick('joystick-right', (dx, dy) => {
            const sens = 0.04;
            this.camera.rotation.y -= dx * sens;
            this.camera.rotation.x -= dy * sens;
            this.camera.rotation.x = Math.max(-1.4, Math.min(1.4, this.camera.rotation.x));
        });

        // Interact button
        document.getElementById('touch-interact').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.state.emit('interact');
        });

        // Jump button
        document.getElementById('touch-jump').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.state.emit('jump');
        });

        // Throw button
        document.getElementById('touch-throw').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.state.emit('throwBall');
        });
    }

    _initJoystick(elId, onMove) {
        const zone = document.getElementById(elId);
        const thumb = document.createElement('div');
        thumb.className = 'joystick-thumb';
        zone.appendChild(thumb);

        let activeId = null;

        zone.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (activeId !== null) return;
            activeId = e.changedTouches[0].identifier;
        }, { passive: false });

        zone.addEventListener('touchmove', (e) => {
            e.preventDefault();
            for (const t of e.changedTouches) {
                if (t.identifier !== activeId) continue;
                const r = zone.getBoundingClientRect();
                const cx = r.left + r.width / 2;
                const cy = r.top + r.height / 2;
                let dx = (t.clientX - cx) / (r.width / 2);
                let dy = (t.clientY - cy) / (r.height / 2);
                const len = Math.hypot(dx, dy);
                if (len > 1) { dx /= len; dy /= len; }
                // Apply dead zone
                if (len < 0.15) { dx = 0; dy = 0; }
                thumb.style.left = (50 + dx * 35) + '%';
                thumb.style.top  = (50 + dy * 35) + '%';
                onMove(dx, dy);
            }
        }, { passive: false });

        const end = (e) => {
            for (const t of e.changedTouches) {
                if (t.identifier !== activeId) continue;
                activeId = null;
                thumb.style.left = '50%';
                thumb.style.top  = '50%';
                onMove(0, 0);
            }
        };
        zone.addEventListener('touchend', end);
        zone.addEventListener('touchcancel', end);
    }

    // ── Public API ──

    lock() {
        if (this.pointerLock) this.pointerLock.lock();
    }

    unlock() {
        if (this.pointerLock) this.pointerLock.unlock();
    }

    getMovementInput() {
        if (!this.isActive || this.state.paused || this.state.terminalOpen) {
            return { forward: 0, right: 0 };
        }
        if (this.isTouch) {
            return { ...this.moveInput };
        }
        return {
            forward: Number(!!this.keys['KeyW']) - Number(!!this.keys['KeyS']),
            right:   Number(!!this.keys['KeyD']) - Number(!!this.keys['KeyA']),
        };
    }

    dispose() {
        if (this.pointerLock) {
            document.removeEventListener('keydown', this._onKeyDown);
            document.removeEventListener('keyup', this._onKeyUp);
            this.pointerLock.dispose();
        }
    }
}
