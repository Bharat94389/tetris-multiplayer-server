const init = () => {
    // Initialize game variables
    tetrisGrid = createNewTetrisGrid();
    score = playerData.score;
    linesCleared = playerData.linesCleared;
    currPieceIndex = playerData.numberOfPieces;
    level = 0;
    delay = TETRIS_DELAY[level];
    gameOver = false;
    currPiece = gameData.tSequence[currPieceIndex];
    nextPiece = gameData.tSequence[currPieceIndex + 1];

    currBlockState = TETRIS_BLOCKS[currPiece];
    currBlockXY = { x: 3, y: 0 };

    addKeyboardEvents();
    showGrid();
    showNextPiece();
    showScore();
    showLevel();

    document.getElementById('info-box')?.remove();

    if (!playerData.gameOver && gameData.status === 'IN_PROGRESS') {
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
            showLevel();
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
        socket.emit(EVENTS.SCORE_UPDATE, { score, pieceNumber: currPieceIndex, linesCleared });
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
            setPlayerData({
                username: userDetails.username,
                score,
                active: true,
                gameOver: true,
            });
            gameOver = true;
            socket.emit(EVENTS.GAME_OVER, { score });
            clearInterval(gameInterval);
        }
        currPieceIndex++;
        // reset values
        currBlockXY = { x: 3, y: 0 };
        currPiece = nextPiece;
        if (currPieceIndex < gameData.tSequence.length) {
            nextPiece = gameData.tSequence[currPieceIndex];
        } else {
            nextPiece = '...';
        }
        currBlockState = TETRIS_BLOCKS[currPiece];
        if (gameData.tSequence.length < currPieceIndex + 5) {
            socket.emit(EVENTS.NEXT_PIECE, { pieceNumber: currPieceIndex });
        }
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

socket.on(EVENTS.SCORE_UPDATE, (data) => setPlayerData(data));

socket.on(EVENTS.GAME_OVER, (data) => setPlayerData(data));
