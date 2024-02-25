// declare all variables required for game
let level,
    delay,
    currPiece,
    nextPiece,
    tetrisGrid,
    currBlockState,
    currBlockXY,
    score,
    linesCleared,
    gameInterval,
    currPieceIndex,
    gameOver,
    status;

// declare all helper functions
const createNewTetrisGrid = () => {
    return new Array(TETRIS_DIMENSIONS.ROWS)
        .fill(null)
        .map(() => new Array(TETRIS_DIMENSIONS.COLS).fill(TETRIS_STATE.EMPTY));
};

const getId = (row, col) => `${row}:${col}`;

const getBackGroundColor = (state) => {
    switch (state) {
        case TETRIS_STATE.FILLED:
            return '#a00';

        default:
            return '#fff';
    }
};

const getState = (tetrisState, row, col) => {
    if (
        currBlockXY.x <= col &&
        currBlockXY.y <= row &&
        currBlockXY.x + currBlockState[0].length > col &&
        currBlockXY.y + currBlockState.length > row
    ) {
        if (
            tetrisState === TETRIS_STATE.FILLED ||
            currBlockState[row - currBlockXY.y][col - currBlockXY.x] === TETRIS_STATE.FILLED
        ) {
            return TETRIS_STATE.FILLED;
        }
        return TETRIS_STATE.EMPTY;
    }
    return tetrisState;
};

const showGrid = () => {
    const gridContainer = document.getElementById('gridContainer');
    gridContainer.innerHTML = '';
    tetrisGrid.forEach((gridRow, row) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'tetris-row';
        gridRow.forEach((tetrisState, col) => {
            const block = document.createElement('div');
            block.id = getId(row, col);
            block.className = 'tetris-block';
            block.style.backgroundColor = getBackGroundColor(getState(tetrisState, row, col));
            rowDiv.appendChild(block);
        });
        gridContainer.appendChild(rowDiv);
    });
};

const showNextPiece = () => {
    document.getElementById('tetrisNextPiece').innerHTML = `Next Piece: ${nextPiece}`;
};

const showScore = () => {
    document.getElementById(
        'tetrisScore'
    ).innerHTML = `Score: ${score} | Lines Cleared: ${linesCleared}`;
};

const isValidMove = (blockXY, blockState) => {
    let isValid = true;
    blockState.forEach((row, i) => {
        row.forEach((state, j) => {
            if (
                state === TETRIS_STATE.FILLED &&
                (blockXY.y + i < 0 ||
                    blockXY.x + j < 0 ||
                    blockXY.y + i >= tetrisGrid.length ||
                    blockXY.x + j >= tetrisGrid[0].length ||
                    tetrisGrid[blockXY.y + i][blockXY.x + j] === TETRIS_STATE.FILLED)
            ) {
                isValid = false;
            }
        });
    });
    return isValid;
};

const makeMove = (blockXY, blockState) => {
    if (isValidMove(blockXY, blockState)) {
        currBlockXY = blockXY;
        showGrid();
        return true;
    }
    return false;
};

const dropPiece = () => {
    const newXY = { ...currBlockXY };
    newXY.y++;
    return makeMove(newXY, currBlockState);
};

const movePieceLeft = () => {
    const newXY = { ...currBlockXY };
    newXY.x--;
    return makeMove(newXY, currBlockState);
};

const movePieceRight = () => {
    const newXY = { ...currBlockXY };
    newXY.x++;
    return makeMove(newXY, currBlockState);
};

const rotateBlockClockwise = () => {
    const rows = currBlockState.length;
    const cols = currBlockState[0].length;
    const rotatedBlock = [];

    for (let i = 0; i < cols; i++) {
        rotatedBlock.push([]);
        for (let j = rows - 1; j >= 0; j--) {
            rotatedBlock[i].push(currBlockState[j][i]);
        }
    }

    if (isValidMove(currBlockXY, rotatedBlock)) {
        currBlockState = rotatedBlock;
        showGrid();
    }
};

const rotateBlockAntiClockwise = () => {
    const rows = currBlockState.length;
    const cols = currBlockState[0].length;
    const rotatedBlock = [];

    for (let j = cols - 1; j >= 0; j--) {
        rotatedBlock.push([]);
        for (let i = 0; i < rows; i++) {
            rotatedBlock[cols - 1 - j].push(currBlockState[i][j]);
        }
    }

    if (isValidMove(currBlockXY, rotatedBlock)) {
        currBlockState = rotatedBlock;
        showGrid();
    }
};

const mergeCurrBlockAndTetris = () => {
    currBlockState.forEach((row, i) => {
        row.forEach((state, j) => {
            if (state === TETRIS_STATE.FILLED) {
                if (
                    currBlockXY.y + i < tetrisGrid.length &&
                    currBlockXY.x + j < tetrisGrid[0].length &&
                    tetrisGrid[currBlockXY.y + i][currBlockXY.x + j] === TETRIS_STATE.EMPTY
                ) {
                    tetrisGrid[currBlockXY.y + i][currBlockXY.x + j] = TETRIS_STATE.FILLED;
                } else {
                    gameOver = true;
                }
            }
        });
    });
};
