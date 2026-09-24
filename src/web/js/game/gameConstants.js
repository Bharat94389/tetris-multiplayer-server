const TETRIS_DIMENSIONS = {
    ROWS: 20,
    COLS: 10,
};

// Empty cells are 0, filled cells store the letter of the piece that filled them
const TETRIS_STATE = {
    EMPTY: 0,
    FILLED: 1,
};

const TETRIS_BLOCKS = {
    i: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ],
    o: [
        [1, 1],
        [1, 1],
    ],
    t: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
    ],
    s: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
    ],
    z: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
    ],
    j: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
    ],
    l: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
    ],
};

const TETRIS_COLORS = {
    i: '#22d3ee',
    o: '#facc15',
    t: '#a855f7',
    s: '#22c55e',
    z: '#ef4444',
    j: '#3b82f6',
    l: '#f97316',
};

// Offsets tried in order when a rotation collides (simple wall / floor kicks)
const TETRIS_KICKS = [
    [0, 0],
    [-1, 0],
    [1, 0],
    [0, -1],
    [-2, 0],
    [2, 0],
];

// Classic (NES) Tetris rules

// NES frames run at 60.0988 fps
const TETRIS_FRAME_MS = 1000 / 60.0988;

// Frames a piece takes to fall one row at each level, levels past the end use the last value
// prettier-ignore
const TETRIS_GRAVITY_FRAMES = [
    48, 43, 38, 33, 28, 23, 18, 13, 8, 6, // levels 0 - 9
    5, 5, 5, // levels 10 - 12
    4, 4, 4, // levels 13 - 15
    3, 3, 3, // levels 16 - 18
    2, 2, 2, 2, 2, 2, 2, 2, 2, 2, // levels 19 - 28
    1, // level 29+
];

// Points for clearing 1 - 4 lines at once, multiplied by (level + 1)
const TETRIS_LINE_POINTS = {
    1: 40,
    2: 100,
    3: 300,
    4: 1200,
};

const TETRIS_LINES_PER_LEVEL = 10;

const TETRIS_LINE_NAMES = {
    1: 'Single',
    2: 'Double',
    3: 'Triple',
    4: 'TETRIS!',
};

// Number of upcoming pieces to keep loaded from the server so a piece is never missing
const TETRIS_PIECES_BUFFER = 4;

// Held key timings (ms): delay before auto repeat, repeat rate, soft drop rate (NES: 1 row / 2 frames)
const TETRIS_INPUT = {
    DAS: 160,
    ARR: 45,
    SOFT_DROP: 2 * TETRIS_FRAME_MS,
};

const TETRIS_START_COUNTDOWN = 3;

const TETRIS_KEY_ACTIONS = {
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowDown: 'down',
    ArrowUp: 'rotateCW',
    ' ': 'hardDrop',
    a: 'left',
    d: 'right',
    s: 'down',
    x: 'rotateCW',
    k: 'rotateCW',
    z: 'rotateCCW',
    j: 'rotateCCW',
};

// Actions that repeat while the key / button is held down
const TETRIS_REPEATABLE_ACTIONS = ['left', 'right', 'down'];
