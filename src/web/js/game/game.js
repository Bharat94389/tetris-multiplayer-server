const init = () => {
    // Initialize game variables
    tetrisGrid = createNewTetrisGrid();
    level = 0;
    delay = TETRIS_DELAY[level];
    score = 0;
    linesCleared = 0;
    currPieceIndex = 0;
    gameOver = false;
    currPiece = gameData.tSequence[currPieceIndex];
    nextPiece = gameData.tSequence[currPieceIndex + 1];

    currBlockState = TETRIS_BLOCKS[currPiece];
    currBlockXY = { x: 3, y: 0 };

    addKeyboardEvents();
    showGrid();
    showNextPiece();
    showScore();

    if (gameData.status === 'IN_PROGRESS') {
        startGame();
    }
};

const addKeyboardEvents = () => {
    document.addEventListener('keydown', (e) => {
        if (e.key === 's') {
            dropPiece();
        }
        if (e.key === 'a') {
            movePieceLeft();
        }
        if (e.key === 'd') {
            movePieceRight();
        }
        if (e.key === 'j') {
            rotateBlockAntiClockwise();
        }
        if (e.key === 'k') {
            rotateBlockClockwise();
        }
    });
};

const updateScore = () => {
    const completeRows = [];
    tetrisGrid.forEach((row, i) => {
        let count = 0;
        row.forEach((s) => (count += s));
        if (count === TETRIS_DIMENSIONS.COLS) {
            completeRows.push(i);
        }
    });

    if (completeRows.length > 0) {
        score += TETRIS_POINTS[level][completeRows.length];
        linesCleared += completeRows.length;
        if (
            TETRIS_LINES_CLEAR_TO_NEXT_LEVEL[level] &&
            TETRIS_LINES_CLEAR_TO_NEXT_LEVEL[level] <= linesCleared
        ) {
            level++;
            delay = TETRIS_DELAY[level];
            clearInterval(gameInterval);
            startGame();
        }
        completeRows.forEach((row) => {
            tetrisGrid.splice(row, 1);
            tetrisGrid.splice(0, 0, new Array(TETRIS_DIMENSIONS.COLS).fill(TETRIS_STATE.EMPTY));
        });

        const player = document.getElementById(`leaderboard-${userDetails.username}`);
        if (player) {
            player.innerHTML = `${userDetails.username} | ${score} | ${true}`;
        }
        socket.emit(EVENTS.SCORE_UPDATE, { score, pieceNumber: currPieceIndex });
        showScore();
    }
};

const startGame = () => {
    gameInterval = setInterval(() => {
        if (dropPiece()) {
            return;
        }
        // if we cannot drop piece then we need to fix this here
        mergeCurrBlockAndTetris();

        if (gameOver) {
            const player = document.getElementById(`leaderboard-${userDetails.username}`);
            if (player) {
                player.innerHTML = `${userDetails.username} | ${score} | true | Game Over`;
            }
            gameOver = true;
            socket.emit(EVENTS.GAME_OVER, { score });
            clearInterval(gameInterval);
        }
        currPieceIndex++;
        // reset values
        currBlockXY = { x: 3, y: 0 };
        currPiece = nextPiece;
        if (gameData.tSequence.length <= currPieceIndex) {
            socket.emit(EVENTS.NEXT_PIECE, { pieceNumber: currPieceIndex });
            nextPiece = '...';
        } else {
            nextPiece = gameData.tSequence[currPieceIndex];
            showNextPiece();
        }
        currBlockState = TETRIS_BLOCKS[currPiece];
        // update UI
        updateScore();
        showNextPiece();
        showGrid();
    }, delay);
};

socket.on(EVENTS.START_GAME, () => {
    gameData.status = 'IN_PROGRESS';
    startGame();
});

socket.on(EVENTS.NEXT_PIECE, (data) => {
    if (gameOver) {
        return;
    }
    gameData = data;
    nextPiece = gameData.tSequence[currPieceIndex];
    showNextPiece();
});

socket.on(EVENTS.SCORE_UPDATE, (data) => {
    const player = document.getElementById(`leaderboard-${data.username}`);
    if (player) {
        player.innerHTML = `${data.username} | ${data.score} | ${data.active}`;
    }
});

socket.on(EVENTS.GAME_OVER, (data) => {
    const player = document.getElementById(`leaderboard-${data.username}`);
    if (player) {
        player.innerHTML = `${data.username} | ${data.score} | ${data.active} | Game Over`;
    }
});