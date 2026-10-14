// ============================================
// CYBER::TOWER — Room Base Class
// Extend this to create new rooms / floors.
// ============================================

import * as THREE from 'three';
import {
    FLOOR_HEIGHT, ROOM_SIZE, ROOM_HEIGHT,
    WALL_THICKNESS, PLAYER_HEIGHT, COLORS, CSS_COLORS,
} from '../constants.js';

export class Room {
    /**
     * @param {string} id           - Floor key (e.g. 'lobby', 'keller')
     * @param {number} floorIndex   - Vertical index (0 = ground, -1 = basement, etc.)
     */
    constructor(id, floorIndex) {
        this.id = id;
        this.floorIndex = floorIndex;
        this.floorY = floorIndex * FLOOR_HEIGHT;
        this.group = new THREE.Group();
        this.group.position.y = this.floorY;
        this.colliders = [];       // Box3[] in WORLD space
        this.interactables = [];   // { mesh, onInteract }[]
        this.animatedObjects = []; // { update(delta) }[]
        this.movingPlatforms = []; // { mesh, box3, axis, range, speed, phase, localX, localY, localZ, w, h, d }[]
    }

    // ── Geometry Helpers ──────────────────────────

    /**
     * Add a box mesh and optionally register a collider.
     * @param {number} x,y,z - Center-bottom position (local, relative to floor)
     * @param {number} w,h,d - Width, height, depth
     * @returns {THREE.Mesh}
     */
    addBox(x, y, z, w, h, d, material, { collider = true } = {}) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
        mesh.position.set(x, y + h / 2, z);
        this.group.add(mesh);
        if (collider) {
            this.colliders.push(new THREE.Box3(
                new THREE.Vector3(x - w / 2, this.floorY + y, z - d / 2),
                new THREE.Vector3(x + w / 2, this.floorY + y + h, z + d / 2)
            ));
        }
        return mesh;
    }

    /** Thin emissive bar. direction: 'x' | 'y' | 'z' */
    addNeonStrip(x, y, z, length, direction, color, intensity = 2) {
        const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color).multiplyScalar(0.2),
            emissive: color,
            emissiveIntensity: intensity,
        });
        const size = { x: 0.06, y: 0.06, z: 0.06 };
        size[direction] = length;
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(size.x, size.y, size.z),
            mat
        );
        mesh.position.set(x, y, z);
        this.group.add(mesh);
        return mesh;
    }

    /**
     * Create a text plane using canvas-rendered text.
     * @returns {THREE.Mesh}
     */
    addTextPlane(text, x, y, z, planeW, planeH, options = {}) {
        const {
            color = CSS_COLORS.neonBlue,
            fontSize = 48,
            fontFamily = 'Orbitron',
            rotY = 0,
        } = options;

        const scale = 2;
        const canvas = document.createElement('canvas');
        canvas.width = 512 * scale;
        canvas.height = 64 * scale;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = `bold ${fontSize * scale}px ${fontFamily}`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const mat = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
        });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(planeW, planeH), mat);
        mesh.position.set(x, y, z);
        if (rotY) mesh.rotation.y = rotY;
        this.group.add(mesh);
        return mesh;
    }

    /** Shortcut for a standard room point light */
    addLight(x, y, z, color, intensity = 1.5, distance = 18) {
        const light = new THREE.PointLight(color, intensity, distance);
        light.position.set(x, y, z);
        this.group.add(light);
        return light;
    }

    /**
     * Add a platform that oscillates along axis 'x' or 'z'.
     * @param {number} x,y,z  - base local position (center-bottom)
     * @param {number} w,h,d  - dimensions
     * @param {'x'|'z'} axis  - movement axis
     * @param {number} range  - +/- movement range (m)
     * @param {number} speed  - oscillation speed (rad/s)
     * @param {THREE.Material} [material]
     */
    addMovingPlatform(x, y, z, w, h, d, axis, range, speed, material) {
        const mat = material || new THREE.MeshStandardMaterial({
            color: 0x0d1a2a, emissive: COLORS.neonBlue, emissiveIntensity: 0.35,
            metalness: 0.7, roughness: 0.3,
        });
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        mesh.position.set(x, y + h / 2, z);
        this.group.add(mesh);

        // Neon outline on top edge
        const edgeMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(COLORS.neonBlue).multiplyScalar(0.2),
            emissive: COLORS.neonBlue, emissiveIntensity: 2,
        });
        const edge = new THREE.Mesh(new THREE.BoxGeometry(w + 0.05, 0.04, d + 0.05), edgeMat);
        edge.position.y = h / 2 + 0.02;
        mesh.add(edge);

        const plat = {
            mesh,
            box3: new THREE.Box3(),
            axis, range, speed,
            phase: Math.random() * Math.PI * 2,
            localX: x, localY: y, localZ: z,
            w, h, d,
        };
        this._updatePlatBox(plat, 0);
        this.movingPlatforms.push(plat);
        return plat;
    }

    _updatePlatBox(p, offset) {
        const cx = p.localX + (p.axis === 'x' ? offset : 0);
        const cz = p.localZ + (p.axis === 'z' ? offset : 0);
        p.box3.set(
            new THREE.Vector3(cx - p.w / 2, this.floorY + p.localY,           cz - p.d / 2),
            new THREE.Vector3(cx + p.w / 2, this.floorY + p.localY + p.h,     cz + p.d / 2)
        );
    }

    /** Called each frame to slide platforms and update their Box3 colliders */
    updateMovingPlatforms(delta) {
        const t = performance.now() * 0.001;
        for (const p of this.movingPlatforms) {
            const offset = Math.sin(t * p.speed + p.phase) * p.range;
            if (p.axis === 'x') {
                p.mesh.position.x = p.localX + offset;
            } else {
                p.mesh.position.z = p.localZ + offset;
            }
            this._updatePlatBox(p, offset);
        }
    }

    // ── Standard Room Shell ──────────────────────

    /**
     * Build floor, walls, ceiling, grid, and neon base strips.
     * Returns the wall material for reuse.
     */
    buildShell(neonColor = COLORS.neonBlue) {
        const S = ROOM_SIZE;
        const H = ROOM_HEIGHT;
        const HS = S / 2;
        const WT = WALL_THICKNESS;

        const wallMat = new THREE.MeshStandardMaterial({
            color: COLORS.darkPanel, roughness: 0.85, metalness: 0.15,
        });
        const floorMat = new THREE.MeshStandardMaterial({
            color: COLORS.darkFloor, roughness: 0.92, metalness: 0.05,
        });
        const ceilMat = new THREE.MeshStandardMaterial({
            color: 0x0a0a14, roughness: 0.95,
        });

        // Floor
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(S, S), floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.group.add(floor);

        // Ceiling
        const ceil = new THREE.Mesh(new THREE.PlaneGeometry(S, S), ceilMat);
        ceil.rotation.x = Math.PI / 2;
        ceil.position.y = H;
        this.group.add(ceil);

        // Walls (N, S, W, E)
        this.addBox(0, 0, -HS, S, H, WT, wallMat);           // North
        this.addBox(0, 0,  HS, S, H, WT, wallMat);           // South
        this.addBox(-HS, 0, 0, WT, H, S, wallMat);           // West
        this.addBox( HS, 0, 0, WT, H, S, wallMat);           // East

        // Neon strips along wall bases
        const offset = 0.35;
        this.addNeonStrip(0, 0.08, -HS + offset, S - 1, 'x', neonColor);
        this.addNeonStrip(0, 0.08,  HS - offset, S - 1, 'x', neonColor);
        this.addNeonStrip(-HS + offset, 0.08, 0, S - 1, 'z', neonColor);
        this.addNeonStrip( HS - offset, 0.08, 0, S - 1, 'z', neonColor);

        // Floor grid
        const grid = new THREE.GridHelper(S, S, neonColor, neonColor);
        grid.material.transparent = true;
        grid.material.opacity = 0.06;
        grid.position.y = 0.01;
        this.group.add(grid);

        return { wallMat, floorMat, ceilMat };
    }

    // ── Lifecycle ─────────────────────────────────

    /** Override: build room geometry. Called once. */
    build() {
        this.buildShell();
        return this.group;
    }

    /** Return spawn point in world space. */
    getSpawnPoint() {
        return new THREE.Vector3(0, this.floorY + PLAYER_HEIGHT, 8);
    }

    /** Per-frame update for animations. */
    update(delta) {
        for (const obj of this.animatedObjects) {
            obj.update(delta);
        }
        // Remove completed animations (e.g. burst particles)
        this.animatedObjects = this.animatedObjects.filter(obj => !obj.done);
    }

    /** Cleanup GPU resources. */
    dispose() {
        this.group.traverse((obj) => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
                for (const m of mats) {
                    if (m.map) m.map.dispose();
                    m.dispose();
                }
            }
        });
    }
}
