// ============================================
// CYBER::TOWER — Three.js Scene Setup
// ============================================

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { COLORS } from './constants.js';

export function initScene() {
    // --- Scene ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.bg);
    scene.fog = new THREE.FogExp2(COLORS.bg, 0.015);

    // --- Camera ---
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        200
    );
    camera.position.set(0, 1.7, 0);
    camera.rotation.order = 'YXZ';
    scene.add(camera);

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.5;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // --- Post-Processing (Bloom) ---
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.7,    // strength  (was 1.2)
        0.4,    // radius    (was 0.5)
        0.35    // threshold (was 0.15 — higher = less glow on dim surfaces)
    );
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());

    // --- Global Lights ---
    const ambient = new THREE.AmbientLight(0x222233, 0.6);
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0x334466, 0x111111, 0.35);
    scene.add(hemi);

    // --- Resize Handler ---
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    });

    return { scene, camera, renderer, composer, bloomPass };
}
