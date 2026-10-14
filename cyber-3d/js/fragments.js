// ============================================
// CYBER::TOWER — Collectible Fragments
// 3 per room, glowing icosahedra hidden around
// ============================================

import * as THREE from 'three';
import { COLORS, ROOM_HEIGHT, ROOM_SIZE } from './constants.js';
import { state } from './state.js';

const FRAGMENT_POSITIONS = {
    lobby: [
        { x: -12, y: 1.2, z: -12 },
        { x: 11, y: 3.5, z: 3 },
        { x: -3, y: 4.2, z: 10 },
    ],
    keller: [
        { x: 13, y: 0.6, z: -13 },
        { x: -12, y: 3, z: 6 },
        { x: 5, y: 1, z: -5 },
    ],
    pixel: [
        { x: -13, y: 4, z: -13 },
        { x: 12, y: 1.5, z: 11 },
        { x: 0, y: 2, z: 8 },
    ],
    krypto: [
        { x: -13, y: 1, z: -13 },
        { x: 13, y: 4, z: 10 },
        { x: -8, y: 2, z: 3 },
    ],
    dach: [
        { x: -12, y: 0.8, z: -10 },
        { x: 12, y: 0.8, z: -10 },
        { x: 0, y: 0.8, z: -ROOM_SIZE / 2 - 3 },  // in secret room area
    ],
};

/**
 * Build fragment meshes for a room and register them as interactables.
 * @param {Room} room - The room instance
 * @param {InteractionSystem} interaction - For registering (optional, handled via room.interactables)
 */
export function buildFragments(room) {
    const positions = FRAGMENT_POSITIONS[room.id];
    if (!positions) return;

    const fragments = [];

    for (let i = 0; i < positions.length; i++) {
        const pos = positions[i];
        const fragmentId = `${room.id}_${i}`;

        // Skip if already collected
        if (state.fragments.collected.has(fragmentId)) continue;

        // Icosahedron geometry — glowing
        const geo = new THREE.IcosahedronGeometry(0.25, 1);
        const mat = new THREE.MeshStandardMaterial({
            color: 0x112200,
            emissive: COLORS.neonGreen,
            emissiveIntensity: 2.5,
            transparent: true,
            opacity: 0.85,
            metalness: 0.5,
            roughness: 0.3,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(pos.x, pos.y, pos.z);
        room.group.add(mesh);

        // Outer wireframe glow
        const wireMat = new THREE.MeshBasicMaterial({
            color: COLORS.neonGreen,
            wireframe: true,
            transparent: true,
            opacity: 0.3,
        });
        const wire = new THREE.Mesh(
            new THREE.IcosahedronGeometry(0.35, 1),
            wireMat
        );
        mesh.add(wire);

        // Small point light
        const light = new THREE.PointLight(COLORS.neonGreen, 0.5, 4);
        light.position.set(pos.x, pos.y, pos.z);
        room.group.add(light);

        fragments.push({ mesh, wire, light, id: fragmentId, baseY: pos.y });

        // Register as interactable
        room.interactables.push({
            mesh,
            onInteract: () => {
                collectFragment(mesh, light, fragmentId, room);
            },
        });
    }

    // Animation: hover + rotate
    if (fragments.length > 0) {
        room.animatedObjects.push({
            update(delta) {
                const t = performance.now() * 0.001;
                for (const frag of fragments) {
                    if (!frag.mesh.visible) continue;
                    frag.mesh.rotation.y += delta * 1.2;
                    frag.mesh.rotation.x = Math.sin(t * 0.8 + frag.baseY) * 0.3;
                    frag.mesh.position.y = frag.baseY + Math.sin(t * 1.5 + frag.baseY * 2) * 0.15;
                    frag.wire.rotation.y -= delta * 0.5;
                }
            }
        });
    }
}

function collectFragment(mesh, light, fragmentId, room) {
    if (state.fragments.collected.has(fragmentId)) return;

    // Collect
    state.collectFragment(fragmentId);

    // Visual: hide the fragment
    mesh.visible = false;
    light.visible = false;

    // Particle burst effect
    spawnBurst(mesh.position.clone(), room);
}

function spawnBurst(position, room) {
    const count = 30;
    const positions = new Float32Array(count * 3);
    const velocities = [];

    for (let i = 0; i < count; i++) {
        positions[i * 3]     = position.x;
        positions[i * 3 + 1] = position.y;
        positions[i * 3 + 2] = position.z;
        velocities.push(
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 3
        );
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
        color: COLORS.neonGreen,
        size: 0.1,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    const points = new THREE.Points(geo, mat);
    room.group.add(points);

    let elapsed = 0;
    const duration = 1.0;

    const animObj = {
        done: false,
        update(delta) {
            elapsed += delta;
            if (elapsed > duration) {
                room.group.remove(points);
                geo.dispose();
                mat.dispose();
                animObj.done = true;
                return;
            }

            const pos = geo.attributes.position.array;
            for (let i = 0; i < count; i++) {
                pos[i * 3]     += velocities[i * 3] * delta;
                pos[i * 3 + 1] += velocities[i * 3 + 1] * delta;
                pos[i * 3 + 2] += velocities[i * 3 + 2] * delta;
                // Slow down
                velocities[i * 3]     *= 0.95;
                velocities[i * 3 + 1] *= 0.95;
                velocities[i * 3 + 2] *= 0.95;
            }
            geo.attributes.position.needsUpdate = true;
            mat.opacity = 1 - (elapsed / duration);
        }
    };
    room.animatedObjects.push(animObj);
}
