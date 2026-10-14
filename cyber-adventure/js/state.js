// ============================================================
// CYBER::ADVENTURES — Game State
// ============================================================

const SAVE_KEY = 'cyber_adventure_save';

export const state = {
  currentScene: 's00_intro',
  puzzlesSolved: new Set(),
  inventoryItems: new Set(),
  dialogFlags: {},          // arbitrary boolean flags per scene

  hasSave() {
    return !!localStorage.getItem(SAVE_KEY);
  },

  save() {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      currentScene:  this.currentScene,
      puzzlesSolved: [...this.puzzlesSolved],
      inventoryItems:[...this.inventoryItems],
      dialogFlags:   this.dialogFlags,
    }));
  },

  load() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    this.currentScene  = d.currentScene  || 's00_intro';
    this.puzzlesSolved = new Set(d.puzzlesSolved  || []);
    this.inventoryItems= new Set(d.inventoryItems || []);
    this.dialogFlags   = d.dialogFlags   || {};
  },

  reset() {
    this.currentScene  = 's00_intro';
    this.puzzlesSolved = new Set();
    this.inventoryItems= new Set();
    this.dialogFlags   = {};
    localStorage.removeItem(SAVE_KEY);
  },

  solvedPuzzle(id) {
    this.puzzlesSolved.add(id);
    this.save();
  },

  isPuzzleSolved(id) {
    return this.puzzlesSolved.has(id);
  },

  setFlag(key, value = true) {
    this.dialogFlags[key] = value;
    this.save();
  },

  getFlag(key) {
    return !!this.dialogFlags[key];
  },
};
