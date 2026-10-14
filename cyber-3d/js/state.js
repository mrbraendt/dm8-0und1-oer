// ============================================
// CYBER::TOWER — Game State
// ============================================

class GameState {
    constructor() {
        this.currentFloor = 'lobby';
        this.unlockedFloors = new Set(['lobby', 'keller']);
        this.fragments = { collected: new Set(), total: 15 };
        this.puzzlesSolved = new Set();
        this.paused = true;
        this.terminalOpen = false;
        this.startTime = 0;
        this._listeners = {};
    }

    on(event, callback) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(callback);
    }

    emit(event, data) {
        const handlers = this._listeners[event];
        if (handlers) handlers.forEach(cb => cb(data));
    }

    unlockFloor(id) {
        if (!this.unlockedFloors.has(id)) {
            this.unlockedFloors.add(id);
            this.emit('floorUnlocked', id);
        }
    }

    solvePuzzle(id) {
        if (!this.puzzlesSolved.has(id)) {
            this.puzzlesSolved.add(id);
            this.emit('puzzleSolved', id);
        }
    }

    collectFragment(id) {
        if (!this.fragments.collected.has(id)) {
            this.fragments.collected.add(id);
            this.emit('fragmentCollected', {
                id,
                count: this.fragments.collected.size,
                total: this.fragments.total,
            });
        }
    }

    setFloor(id) {
        this.currentFloor = id;
        this.emit('floorChanged', id);
    }
}

export const state = new GameState();
