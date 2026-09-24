// Pure game helpers (no game state) and canvas drawing helpers

const createNewTetrisGrid = () =>
    Array.from({ length: TETRIS_DIMENSIONS.ROWS }, () =>
        new Array(TETRIS_DIMENSIONS.COLS).fill(TETRIS_STATE.EMPTY)
    );

const isValidGrid = (grid) =>
    Array.isArray(grid) &&
    grid.length === TETRIS_DIMENSIONS.ROWS &&
    grid.every((row) => Array.isArray(row) && row.length === TETRIS_DIMENSIONS.COLS);

const createPiece = (type) => {
    const shape = TETRIS_BLOCKS[type];
    return {
        type,
        shape,
        x: Math.floor((TETRIS_DIMENSIONS.COLS - shape[0].length) / 2),
        y: 0,
    };
};

const rotateShape = (shape, clockwise) => {
    const size = shape.length;
    return shape.map((row, i) =>
        row.map((_, j) => (clockwise ? shape[size - 1 - j][i] : shape[j][size - 1 - i]))
    );
};

const collides = (grid, shape, x, y) =>
    shape.some((row, i) =>
        row.some((filled, j) => {
            if (!filled) {
                return false;
            }
            const r = y + i;
            const c = x + j;
            return (
                r < 0 ||
                c < 0 ||
                r >= TETRIS_DIMENSIONS.ROWS ||
                c >= TETRIS_DIMENSIONS.COLS ||
                grid[r][c] !== TETRIS_STATE.EMPTY
            );
        })
    );

const getDropY = (grid, piece) => {
    let y = piece.y;
    while (!collides(grid, piece.shape, piece.x, y + 1)) {
        y++;
    }
    return y;
};

const mergePiece = (grid, piece) => {
    piece.shape.forEach((row, i) =>
        row.forEach((filled, j) => {
            if (filled) {
                grid[piece.y + i][piece.x + j] = piece.type;
            }
        })
    );
};

// Removes the complete rows from the grid and returns how many were removed
const clearLines = (grid) => {
    let cleared = 0;
    for (let row = grid.length - 1; row >= 0; row--) {
        if (grid[row].every((cell) => cell !== TETRIS_STATE.EMPTY)) {
            grid.splice(row, 1);
            cleared++;
        }
    }
    for (let i = 0; i < cleared; i++) {
        grid.unshift(new Array(TETRIS_DIMENSIONS.COLS).fill(TETRIS_STATE.EMPTY));
    }
    return cleared;
};

const getLevel = (linesCleared) => Math.floor(linesCleared / TETRIS_LINES_PER_LEVEL);

const getDelay = (level) =>
    TETRIS_GRAVITY_FRAMES[Math.min(level, TETRIS_GRAVITY_FRAMES.length - 1)] * TETRIS_FRAME_MS;

const getLinePoints = (level, lines) => (TETRIS_LINE_POINTS[Math.min(lines, 4)] || 0) * (level + 1);

// Shape without its empty rows / columns, used for the preview
const trimShape = (shape) => {
    const rows = shape.filter((row) => row.some(Boolean));
    const cols = rows[0].map((_, j) => rows.some((row) => row[j]));
    const first = cols.indexOf(true);
    const last = cols.lastIndexOf(true);
    return rows.map((row) => row.slice(first, last + 1));
};

// ---------- Drawing ----------

// Keeps the canvas backing store in sync with its CSS size for crisp drawing
const fitCanvas = (canvas) => {
    const dpr = window.devicePixelRatio || 1;
    const width = Math.round(canvas.clientWidth * dpr);
    const height = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
    }
    return { width, height, dpr };
};

const drawCell = (ctx, x, y, size, color, alpha = 1) => {
    const gap = Math.max(1, size * 0.06);
    const s = size - gap * 2;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(x + gap, y + gap, s, s);

    // bevel for a bit of depth
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.fillRect(x + gap, y + gap, s, s * 0.14);
    ctx.fillRect(x + gap, y + gap, s * 0.14, s);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.fillRect(x + gap, y + gap + s * 0.86, s, s * 0.14);
    ctx.fillRect(x + gap + s * 0.86, y + gap, s * 0.14, s);
    ctx.globalAlpha = 1;
};

const drawGhostCell = (ctx, x, y, size, color) => {
    const gap = Math.max(1, size * 0.08);
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = color;
    ctx.fillRect(x + gap, y + gap, size - gap * 2, size - gap * 2);
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, size * 0.05);
    ctx.strokeRect(x + gap, y + gap, size - gap * 2, size - gap * 2);
    ctx.globalAlpha = 1;
};

const drawBoard = (canvas, grid, piece, { showGhost = true, dim = false } = {}) => {
    const ctx = canvas.getContext('2d');
    const { width, height } = fitCanvas(canvas);
    const size = Math.min(width / TETRIS_DIMENSIONS.COLS, height / TETRIS_DIMENSIONS.ROWS);

    ctx.clearRect(0, 0, width, height);

    // grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let c = 1; c < TETRIS_DIMENSIONS.COLS; c++) {
        ctx.moveTo(Math.round(c * size) + 0.5, 0);
        ctx.lineTo(Math.round(c * size) + 0.5, height);
    }
    for (let r = 1; r < TETRIS_DIMENSIONS.ROWS; r++) {
        ctx.moveTo(0, Math.round(r * size) + 0.5);
        ctx.lineTo(width, Math.round(r * size) + 0.5);
    }
    ctx.stroke();

    const lockedAlpha = dim ? 0.35 : 1;
    grid.forEach((row, r) =>
        row.forEach((cell, c) => {
            if (cell !== TETRIS_STATE.EMPTY) {
                const color = TETRIS_COLORS[cell] || '#94a3b8';
                drawCell(ctx, c * size, r * size, size, color, lockedAlpha);
            }
        })
    );

    if (!piece) {
        return;
    }
    const color = TETRIS_COLORS[piece.type];
    if (showGhost) {
        const ghostY = getDropY(grid, piece);
        if (ghostY !== piece.y) {
            piece.shape.forEach((row, i) =>
                row.forEach((filled, j) => {
                    if (filled) {
                        drawGhostCell(ctx, (piece.x + j) * size, (ghostY + i) * size, size, color);
                    }
                })
            );
        }
    }
    piece.shape.forEach((row, i) =>
        row.forEach((filled, j) => {
            if (filled) {
                drawCell(ctx, (piece.x + j) * size, (piece.y + i) * size, size, color);
            }
        })
    );
};

// Draws the next piece centered in the preview canvas
const drawPreview = (canvas, type) => {
    const ctx = canvas.getContext('2d');
    const { width, height } = fitCanvas(canvas);
    ctx.clearRect(0, 0, width, height);
    if (!TETRIS_BLOCKS[type]) {
        return;
    }

    const shape = trimShape(TETRIS_BLOCKS[type]);
    const size = Math.min(width / 5, height / 3);
    const offsetX = (width - shape[0].length * size) / 2;
    const offsetY = (height - shape.length * size) / 2;
    shape.forEach((row, i) =>
        row.forEach((filled, j) => {
            if (filled) {
                drawCell(ctx, offsetX + j * size, offsetY + i * size, size, TETRIS_COLORS[type]);
            }
        })
    );
};
