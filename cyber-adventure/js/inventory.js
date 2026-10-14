// ============================================================
// CYBER::ADVENTURES — Badge System (Abschluss-Abzeichen)
// ============================================================

import { state } from './state.js';

const slotsEl   = document.getElementById('inventory-slots');
const tooltipEl = document.getElementById('inventory-tooltip');
const labelEl   = document.getElementById('inventory-label');

// Badge registry — one per chapter, in story order
const BADGES = [
  {
    id:      'visitenkarte_byte',
    icon:    '💾', short: 'S00', color: '#00d4ff',
    label:   'Binär-Detektivin',
    desc:    'Binärcode geknackt — BYTE WAR HIER!',
  },
  {
    id:      'turing_protokoll',
    icon:    '📡', short: 'S01', color: '#00ff88',
    label:   'ASCII-Agentin',
    desc:    'ASCII-Rätsel gelöst: SCHULE.',
  },
  {
    id:      'schicht_diagram',
    icon:    '🤖', short: 'S02', color: '#00d4ff',
    label:   'Turing-Expertin',
    desc:    'Turing-Maschine konfiguriert und erfolgreich gestartet.',
  },
  {
    id:      'korrupte_datei',
    icon:    '🧱', short: 'S03', color: '#00ff88',
    label:   'Schichten-Hackerin',
    desc:    'Softwareschichten in die richtige Reihenfolge gebracht.',
  },
  {
    id:      'paradox_notiz',
    icon:    '🎮', short: 'S04', color: '#ff2d78',
    label:   'Pixel-Pilotin',
    desc:    'Das Pixel-Schloss auf PETEs Backup geknackt.',
  },
  {
    id:      'deepfake_screenshoot',
    icon:    '♾️', short: 'S05', color: '#a855f7',
    label:   'Paradox-Jägerin',
    desc:    'Das Halteproblem verstanden — unentscheidbar!',
  },
  {
    id:      'geheimbrief',
    icon:    '🧠', short: 'S06', color: '#ff2d78',
    label:   'KI-Kritikerin',
    desc:    'KI-Bias und Halluzinationen aufgedeckt.',
  },
  {
    id:      'passwort_zettel',
    icon:    '🔐', short: 'S07', color: '#00d4ff',
    label:   'Krypto-Crack',
    desc:    'ROT13 entschlüsselt: INFORMATION.',
  },
];

let domSlots = {};   // id → { el, iconEl }

export const inventory = {

  init() {
    slotsEl.innerHTML = '';
    domSlots = {};
    for (const badge of BADGES) {
      this._renderSlot(badge);
    }
    this._updateCounter();
  },

  restoreFromState() {
    for (const id of state.inventoryItems) {
      this._unlock(id, false);
    }
    this._updateCounter();
  },

  addItem(id) {
    if (state.inventoryItems.has(id)) return false;
    state.inventoryItems.add(id);
    state.save();
    this._unlock(id, true);
    this._updateCounter();
    return true;
  },

  hasItem(id) {
    return state.inventoryItems.has(id);
  },

  // ---- private ----

  _renderSlot(badge) {
    const slot = document.createElement('div');
    slot.className = 'badge-slot locked';
    slot.dataset.id = badge.id;

    const iconEl = document.createElement('div');
    iconEl.className = 'badge-icon';
    iconEl.textContent = '?';

    const shortEl = document.createElement('div');
    shortEl.className = 'badge-short';
    shortEl.textContent = badge.short;

    slot.append(iconEl, shortEl);

    slot.addEventListener('mouseenter', () => {
      const earned = state.inventoryItems.has(badge.id);
      if (earned) {
        tooltipEl.innerHTML =
          `<span class="badge-tt-name" style="color:${badge.color}">${badge.icon} ${badge.label}</span>` +
          `<span class="badge-tt-desc">${badge.short} · ${badge.desc}</span>`;
      } else {
        tooltipEl.innerHTML =
          `<span class="badge-tt-locked">${badge.short} · noch nicht verdient</span>`;
      }
      tooltipEl.style.display = 'flex';
      const r   = slot.getBoundingClientRect();
      const tw  = tooltipEl.offsetWidth || 240;
      tooltipEl.style.left = Math.max(4, Math.min(r.left + r.width / 2 - tw / 2, window.innerWidth - tw - 8)) + 'px';
    });
    slot.addEventListener('mouseleave', () => {
      tooltipEl.style.display = 'none';
    });

    slotsEl.appendChild(slot);
    domSlots[badge.id] = { el: slot, iconEl };
  },

  _unlock(id, animate) {
    const badge = BADGES.find(b => b.id === id);
    if (!badge) return;
    const entry = domSlots[id];
    if (!entry) return;

    const { el, iconEl } = entry;
    iconEl.textContent = badge.icon;
    el.classList.remove('locked');
    el.classList.add('unlocked');
    el.style.setProperty('--badge-color', badge.color);

    if (animate) {
      el.classList.add('badge-earn');
      el.addEventListener('animationend', () => el.classList.remove('badge-earn'), { once: true });
    }
  },

  _updateCounter() {
    const total  = BADGES.length;
    const earned = [...state.inventoryItems].filter(id => BADGES.some(b => b.id === id)).length;
    labelEl.innerHTML =
      `ABZEICHEN<br><span class="badge-counter">${earned}&thinsp;/&thinsp;${total}</span>`;
  },
};
