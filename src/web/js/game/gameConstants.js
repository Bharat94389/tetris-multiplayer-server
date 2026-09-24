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

const TETRIS_DELAY = {
    0: 1000,
    1: 900,
    2: 800,
    3: 700,
    4: 600,
    5: 500,
    6: 400,
    7: 300,
    8: 200,
    9: 100,
};

const TETRIS_MAX_LEVEL = 9;

const TETRIS_POINTS = {
    0: {
        1: 40,
        2: 100,
        3: 300,
        4: 800,
    },
    1: {
        1: 40,
        2: 100,
        3: 300,
        4: 800,
    },
    2: {
        1: 40,
        2: 100,
        3: 300,
        4: 800,
    },
    3: {
        1: 40,
        2: 100,
        3: 300,
        4: 800,
    },
    4: {
        1: 40,
        2: 100,
        3: 300,
        4: 800,
    },
    5: {
        1: 50,
        2: 120,
        3: 350,
        4: 900,
    },
    6: {
        1: 60,
        2: 140,
        3: 400,
        4: 1000,
    },
    7: {
        1: 70,
        2: 160,
        3: 450,
        4: 1100,
    },
    8: {
        1: 80,
        2: 180,
        3: 500,
        4: 1200,
    },
    9: {
        1: 90,
        2: 200,
        3: 550,
        4: 1300,
    },
};

// Total lines cleared needed to leave a level
const TETRIS_LINES_CLEAR_TO_NEXT_LEVEL = {
    0: 10,
    1: 20,
    2: 30,
    3: 40,
    4: 50,
    5: 60,
    6: 70,
    7: 80,
    8: 90,
    9: 100,
};

const TETRIS_SOFT_DROP_POINTS = 1;
const TETRIS_HARD_DROP_POINTS = 2;

const TETRIS_LINE_NAMES = {
    1: 'Single',
    2: 'Double',
    3: 'Triple',
    4: 'TETRIS!',
};

// Number of upcoming pieces shown in the preview
const TETRIS_PREVIEW_COUNT = 3;

// Held key timings (ms): delay before auto repeat, repeat rate, soft drop rate
const TETRIS_INPUT = {
    DAS: 160,
    ARR: 45,
    SOFT_DROP: 40,
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
