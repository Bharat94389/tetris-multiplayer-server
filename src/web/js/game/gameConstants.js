const TETRIS_DIMENSIONS = {
    ROWS: 20,
    COLS: 10,
};

const TETRIS_STATE = {
    EMPTY: 0,
    FILLED: 1,
};

const TETRIS_BLOCKS = {
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
    t: [
        [1, 1, 1],
        [0, 1, 0],
        [0, 0, 0],
    ],
    l: [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1],
    ],
    j: [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0],
    ],
    o: [
        [1, 1],
        [1, 1],
    ],
    i: [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
    ],
};

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
