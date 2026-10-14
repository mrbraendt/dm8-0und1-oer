// ============================================================
// CYBER::ADVENTURES — Scene Engine
// ============================================================

import { state }     from './state.js';
import { dialog }    from './dialog.js';
import { inventory } from './inventory.js';

// Lazy-load scene modules
const SCENES = {
  s00_intro:  () => import('./scenes/s00_intro.js'),
  s01_bits:   () => import('./scenes/s01_bits.js'),
  s02_turing: () => import('./scenes/s02_turing.js'),
  s03_server: () => import('./scenes/s03_server.js'),
  s04_pixel:  () => import('./scenes/s04_pixel.js'),
  s05_halt:   () => import('./scenes/s05_halt.js'),
  s06_ki:     () => import('./scenes/s06_ki.js'),
  s07_krypto: () => import('./scenes/s07_krypto.js'),
  s08_finale: () => import('./scenes/s08_finale.js'),
};

const CHAPTER_NAMES = {
  s00_intro:  'KAPITEL 0 — KIMS ZIMMER',
  s01_bits:   'KAPITEL 1 — BITS & BYTES',
  s02_turing: 'KAPITEL 2 — DIE TURING-MASCHINE',
  s03_server: 'KAPITEL 3 — DER SERVERRAUM',
  s04_pixel:  'KAPITEL 4 — DER BACKUP-DRIVE',
  s05_halt:   'KAPITEL 5 — PARASIT.EXE',
  s06_ki:     'KAPITEL 6 — KI-LABOR',
  s07_krypto: 'KAPITEL 7 — BYTES VERSTECK',
  s08_finale: 'KAPITEL 8 — FINALES PROTOKOLL',
};

const container   = document.getElementById('scene-container');
const chapterLbl  = document.getElementById('chapter-label');
const overlay     = document.getElementById('transition-overlay');
const tooltip     = document.getElementById('hotspot-tooltip');
const puzzlePanel = document.getElementById('puzzle-overlay');
const puzzleBox   = document.getElementById('puzzle-content');
const puzzleClose = document.getElementById('puzzle-close');
const notifEl     = document.getElementById('notification');

let activeScene  = null;
let notifTimer   = null;
let activeItem   = null;     // selected inventory item
let debugMode    = false;
let oKeyCount    = 0;
let oKeyTimer    = null;

// ---- Scene→Badge mapping for debug navigation ----
const SCENE_BADGES = [
  { scene: 's00_intro',  badge: 'visitenkarte_byte' },
  { scene: 's01_bits',   badge: 'turing_protokoll' },
  { scene: 's02_turing', badge: 'schicht_diagram' },
  { scene: 's03_server', badge: 'korrupte_datei' },
  { scene: 's04_pixel',  badge: 'paradox_notiz' },
  { scene: 's05_halt',   badge: 'deepfake_screenshoot' },
  { scene: 's06_ki',     badge: 'geheimbrief' },
  { scene: 's07_krypto', badge: 'passwort_zettel' },
  // s08_finale has no badge, so no entry
];

export const engine = {

  init() {
    puzzleClose.addEventListener('click', () => this.closePuzzle());
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.closePuzzle();

      // ---- Debug cheat: press 'o' five times ----
      if (e.key === 'o' || e.key === 'O') {
        oKeyCount++;
        clearTimeout(oKeyTimer);
        oKeyTimer = setTimeout(() => { oKeyCount = 0; }, 1500);
        if (oKeyCount >= 5) {
          oKeyCount = 0;
          this._activateDebugMode();
        }
      }
    });

    // Mouse tracking for tooltip
    document.addEventListener('mousemove', e => {
      tooltip.style.left = (e.clientX + 14) + 'px';
      tooltip.style.top  = (e.clientY - 10) + 'px';
    });
  },

  async loadScene(id) {
    state.currentScene = id;
    state.save();

    // Fade out
    overlay.classList.add('active');
    await wait(500);

    // Clear previous scene
    dialog.hide();
    container.innerHTML = '';
    container.className = '';
    activeScene = null;

    // Update chapter label
    chapterLbl.textContent = CHAPTER_NAMES[id] || id;

    // Load + build new scene
    const mod = await SCENES[id]();
    activeScene = mod;
    mod.build(container, this);

    // Fade in
    await wait(80);
    overlay.classList.remove('active');
    await wait(500);

    // Scene entry dialog
    if (mod.onEnter) mod.onEnter(this);
  },

  // ---- Hotspot helpers ----

  addHotspot(el, label, callback, requireItem = null) {
    el.classList.add('hotspot');

    const glow = document.createElement('div');
    glow.className = 'hs-glow';
    el.appendChild(glow);

    const hsLabel = document.createElement('div');
    hsLabel.className = 'hs-label';
    hsLabel.textContent = '▶ ' + label;
    el.appendChild(hsLabel);

    el.addEventListener('mouseenter', () => {
      tooltip.style.display = 'none';
    });
    el.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });

    el.addEventListener('click', (e) => {
      if (e) e.stopPropagation();
      tooltip.style.display = 'none';
      if (requireItem && activeItem !== requireItem) {
        dialog.show('kim', `Ich brauche dafür wohl ${requireItem === requireItem ? 'das richtige Item' : requireItem}.`, []);
        return;
      }
      callback();
    });
  },

  setActiveItem(id) { activeItem = id; },
  getActiveItem()   { return activeItem; },
  clearActiveItem() { activeItem = null; },

  // ---- Puzzle overlay ----

  openPuzzle(buildFn) {
    document.body.classList.remove('dialog-active'); 
    puzzlePanel.classList.remove('hidden');
    puzzleBox.innerHTML = '<div style="text-align:center; padding:2rem;">LADE ANALYSE-SYSTEM...</div>';
    setTimeout(() => {
      puzzleBox.innerHTML = '';
      buildFn(puzzleBox);
    }, 50);
  },

  closePuzzle() {
    puzzlePanel.classList.add('hidden');
    puzzleBox.innerHTML = '';
  },

  // ---- Notification ----

  notify(text, duration = 4000) {
    notifEl.textContent = text;
    notifEl.classList.remove('hidden');
    notifEl.classList.add('visible');
    clearTimeout(notifTimer);
    notifTimer = setTimeout(() => {
      notifEl.classList.remove('visible');
      setTimeout(() => notifEl.classList.add('hidden'), 400);
    }, duration);
  },
  // ---- Debug mode ----

  _activateDebugMode() {
    if (debugMode) {
      this.notify('🐛 DEBUG bereits aktiv — Abzeichen anklicken zum Szenenwechsel', 3000);
      return;
    }
    debugMode = true;

    // Unlock all puzzles in state (except s05_halt so user can test the switch)
    const allPuzzles = ['s00_binary','s01_ascii','s02_turing','s03_layers','s04_pixel','s06_ki','s07_rot13','s08_datenschutz'];
    allPuzzles.forEach(id => state.puzzlesSolved.add(id));

    // Unlock all inventory items / badges
    const allBadges = ['visitenkarte_byte','turing_protokoll','schicht_diagram','korrupte_datei','paradox_notiz','deepfake_screenshoot','geheimbrief','passwort_zettel'];
    allBadges.forEach(id => inventory.addItem(id));

    state.save();

    // Make each badge slot navigate to its scene on click
    const slots = document.querySelectorAll('#inventory-slots .badge-slot');
    slots.forEach(slot => {
      const mapping = SCENE_BADGES.find(m => m.badge === slot.dataset.id);
      if (!mapping) return;
      slot.title = '🐛 DEBUG: Klicken = Szene ' + mapping.scene;
      slot.style.outline = '2px dashed rgba(255,224,0,0.5)';
      slot.style.cursor  = 'pointer';
      // Remove old click-to-nothing handler by cloning
      const fresh = slot.cloneNode(true);
      slot.parentNode.replaceChild(fresh, slot);
      fresh.addEventListener('click', () => {
        dialog.hide();
        this.loadScene(mapping.scene);
      });
      // Re-attach tooltip hover on the fresh element
      fresh.addEventListener('mouseenter', () => {
        const tt = document.getElementById('inventory-tooltip');
        if (tt) {
          tt.innerHTML = `<span style="color:var(--neon-yellow);font-family:var(--font-head);font-size:0.7rem;">🐛 ${mapping.scene}</span>`;
          tt.style.display = 'flex';
          const r = fresh.getBoundingClientRect();
          tt.style.left = Math.max(4, r.left + r.width/2 - 100) + 'px';
        }
      });
      fresh.addEventListener('mouseleave', () => {
        const tt = document.getElementById('inventory-tooltip');
        if (tt) tt.style.display = 'none';
      });
    });

    // Visual debug indicator in chapter label
    const lbl = document.getElementById('chapter-label');
    if (lbl) lbl.style.color = 'var(--neon-yellow)';

    this.notify('🐛 DEBUG MODUS AKTIV — alle Kapitel frei · Abzeichen anklicken zum Wechseln', 5000);
  },
};

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}
