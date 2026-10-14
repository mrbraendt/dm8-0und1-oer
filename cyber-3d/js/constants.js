// ============================================
// CYBER::TOWER — Shared Constants
// ============================================

export const FLOOR_HEIGHT = 12;   // vertical distance between floors
export const ROOM_SIZE = 30;      // room width & depth
export const ROOM_HEIGHT = 5;     // ceiling height
export const WALL_THICKNESS = 0.5;
export const PLAYER_HEIGHT = 1.7;
export const PLAYER_RADIUS = 0.4;
export const MOVE_SPEED = 7;
export const GRAVITY = 18;
export const JUMP_SPEED = 7.5;

// Three.js color hex values
export const COLORS = {
    bg:        0x0a0a0f,
    neonBlue:  0x00d4ff,
    neonGreen: 0x00ff88,
    neonPink:  0xff2d78,
    white:     0xe8eaf6,
    dim:       0x1a1a2e,
    darkPanel: 0x0d0d1a,
    darkFloor: 0x080810,
};

// CSS color strings (for CanvasTexture)
export const CSS_COLORS = {
    neonBlue:  '#00d4ff',
    neonGreen: '#00ff88',
    neonPink:  '#ff2d78',
    white:     '#e8eaf6',
    dim:       '#556677',
};

// Floor definitions — add new floors here to extend the game
export const FLOORS = {
    lobby:  { index: 0,  name: 'LOBBY',        color: COLORS.neonBlue  },
    keller: { index: -1, name: 'B1: HARDWARE',  color: COLORS.neonGreen },
    pixel:  { index: 1,  name: 'F2: PIXEL',     color: COLORS.neonBlue  },
    krypto: { index: 2,  name: 'F3: KRYPTO',    color: COLORS.neonPink  },
    dach:   { index: 3,  name: 'DACH',          color: COLORS.neonBlue  },
};
