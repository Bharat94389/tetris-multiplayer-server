const gameId = decodeURIComponent(window.location.pathname.split('/').filter(Boolean).pop() || '');

const GAME_STATUS = {
    IN_PROGRESS: 'IN_PROGRESS',
    WAITING: 'WAITING',
    COMPLETED: 'COMPLETED',
};

// Local status of this player's game
const PLAY_STATE = {
    LOADING: 'loading',
    WAITING: 'waiting',
    COUNTDOWN: 'countdown',
    PLAYING: 'playing',
    OVER: 'over',
};

const game = {
    state: PLAY_STATE.LOADING,
    initialized: false,
    owner: null,
    serverStatus: GAME_STATUS.WAITING,
    sequence: '',
    grid: createNewTetrisGrid(),
    piece: null,
    pieceIndex: 0,
    score: 0,
    lines: 0,
    level: 0,
    dropTimer: 0,
    awaitingPiece: false,
    requestingPieces: false,
    lastFrame: 0,
};

// username -> player stats as sent by the server
const players = new Map();

const el = {
    board: document.getElementById('boardCanvas'),
    next: document.getElementById('nextCanvas'),
    score: document.getElementById('statScore'),
    level: document.getElementById('statLevel'),
    lines: document.getElementById('statLines'),
    overlay: document.getElementById('overlay'),
    overlayTitle: document.getElementById('overlayTitle'),
    overlayText: document.getElementById('overlayText'),
    overlayActions: document.getElementById('overlayActions'),
    toast: document.getElementById('toast'),
    playerList: document.getElementById('playerList'),
    inviteLink: document.getElementById('inviteLink'),
    copyInvite: document.getElementById('copyInvite'),
    connectionDot: document.getElementById('connectionDot'),
    connectionText: document.getElementById('connectionText'),
};

// ---------- UI helpers ----------

const showOverlay = ({ title, text = '', actions = [], countdown = false }) => {
    el.overlayTitle.textContent = title;
    el.overlayTitle.classList.toggle('countdown', countdown);
    el.overlayText.textContent = text;
    el.overlayText.classList.toggle('hidden', !text);
    el.overlayActions.innerHTML = '';
    actions.forEach(({ label, onClick, primary, href }) => {
        const button = document.createElement(href ? 'a' : 'button');
        button.className = `btn ${primary ? 'btn-primary' : ''}`;
        button.textContent = label;
        if (href) {
            button.href = href;
        } else {
            button.addEventListener('click', onClick);
        }
        el.overlayActions.appendChild(button);
    });
    el.overlay.classList.remove('hidden');
};

const hideOverlay = () => el.overlay.classList.add('hidden');

let toastTimeout;
const showToast = (message) => {
    el.toast.textContent = message;
    el.toast.classList.remove('show');
    // force reflow so the animation restarts
    void el.toast.offsetWidth;
    el.toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => el.toast.classList.remove('show'), 1200);
};

const setConnection = (online, text) => {
    el.connectionDot.className = `dot ${online ? 'dot-online' : 'dot-offline'}`;
    el.connectionText.textContent = text;
};

const updateStats = () => {
    el.score.textContent = game.score.toLocaleString();
    el.level.textContent = game.level;
    el.lines.textContent = game.lines;
};

const getPlayerStatus = (player) => {
    if (player.gameOver) {
        return 'Out';
    }
    if (player.active === false) {
        return 'Offline';
    }
    if (game.serverStatus !== GAME_STATUS.WAITING) {
        return 'Playing';
    }
    return 'Ready';
};

const getDotClass = (player) => {
    if (player.gameOver) {
        return '';
    }
    return player.active === false ? 'dot-offline' : 'dot-online';
};

const renderPlayers = () => {
    const sorted = [...players.values()].sort((a, b) => (b.score || 0) - (a.score || 0));
    el.playerList.innerHTML = '';
    sorted.forEach((player, index) => {
        const isMe = player.username === userDetails.username;
        const status = getPlayerStatus(player);
        const li = document.createElement('li');
        li.className = `player ${isMe ? 'is-me' : ''} ${player.gameOver ? 'is-out' : ''}`;
        li.innerHTML = `
            <span class="player-rank">${index + 1}</span>
            <div class="player-info">
                <div class="player-name">
                    <span>${escapeHtml(player.username)}${isMe ? ' (you)' : ''}</span>
                    ${player.username === game.owner ? '<span class="chip chip-host">Host</span>' : ''}
                </div>
                <div class="player-meta">
                    <span class="dot ${getDotClass(player)}"></span>
                    <span>${status}</span>
                    <span>· ${player.linesCleared || 0} lines</span>
                </div>
            </div>
            <span class="player-score">${(player.score || 0).toLocaleString()}</span>`;
        el.playerList.appendChild(li);
    });
};

const setPlayerData = (data) => {
    if (!data || !data.username) {
        return;
    }
    players.set(data.username, { ...players.get(data.username), ...data });
    renderPlayers();
};

const updateOwnPlayer = () =>
    setPlayerData({
        username: userDetails.username,
        score: game.score,
        linesCleared: game.lines,
        numberOfPieces: game.pieceIndex,
        gameOver: game.state === PLAY_STATE.OVER,
        active: true,
    });

// ---------- Piece sequence ----------

const requestMorePieces = () => {
    if (game.requestingPieces) {
        return;
    }
    if (game.sequence.length > game.pieceIndex + TETRIS_PREVIEW_COUNT + 1) {
        return;
    }
    game.requestingPieces = true;
    // the server only appends pieces once pieceNumber reaches the end of its sequence
    socket.emit(EVENTS.NEXT_PIECE, { pieceNumber: game.sequence.length });
};

const onNextPieces = (gameData) => {
    game.requestingPieces = false;
    if (!gameData || typeof gameData.tSequence !== 'string') {
        return;
    }
    const grew = gameData.tSequence.length > game.sequence.length;
    if (grew) {
        game.sequence = gameData.tSequence;
    }
    if (game.awaitingPiece && game.state === PLAY_STATE.PLAYING) {
        spawnPiece();
    }
    if (grew) {
        requestMorePieces();
    }
};

// ---------- Game actions ----------

const spawnPiece = () => {
    const type = game.sequence[game.pieceIndex];
    requestMorePieces();
    if (!TETRIS_BLOCKS[type]) {
        // wait for the server to send more pieces
        game.piece = null;
        game.awaitingPiece = true;
        return;
    }
    game.awaitingPiece = false;
    game.dropTimer = 0;
    const piece = createPiece(type);
    game.piece = piece;
    if (collides(game.grid, piece.shape, piece.x, piece.y)) {
        endGame();
    }
};

const movePiece = (dx, dy) => {
    const { piece, grid } = game;
    if (!piece || collides(grid, piece.shape, piece.x + dx, piece.y + dy)) {
        return false;
    }
    piece.x += dx;
    piece.y += dy;
    return true;
};

const rotatePiece = (clockwise) => {
    const { piece, grid } = game;
    if (!piece) {
        return;
    }
    const shape = rotateShape(piece.shape, clockwise);
    const kick = TETRIS_KICKS.find(
        ([dx, dy]) => !collides(grid, shape, piece.x + dx, piece.y + dy)
    );
    if (kick) {
        piece.shape = shape;
        piece.x += kick[0];
        piece.y += kick[1];
    }
};

const softDrop = () => {
    if (movePiece(0, 1)) {
        game.score += TETRIS_SOFT_DROP_POINTS;
        game.dropTimer = 0;
        updateStats();
    }
};

const hardDrop = () => {
    if (!game.piece) {
        return;
    }
    const dropY = getDropY(game.grid, game.piece);
    game.score += (dropY - game.piece.y) * TETRIS_HARD_DROP_POINTS;
    game.piece.y = dropY;
    lockPiece();
};

const lockPiece = () => {
    mergePiece(game.grid, game.piece);
    game.piece = null;

    const cleared = clearLines(game.grid);
    if (cleared) {
        game.score += getLinePoints(game.level, cleared);
        game.lines += cleared;
        const level = getLevel(game.lines);
        if (level > game.level) {
            showToast(`Level ${level}!`);
        } else {
            showToast(`${TETRIS_LINE_NAMES[cleared]} +${getLinePoints(game.level, cleared)}`);
        }
        game.level = level;
    }

    game.pieceIndex++;
    updateStats();
    updateOwnPlayer();
    // the board is stored on the server so the game can continue after a refresh
    socket.emit(EVENTS.SCORE_UPDATE, {
        score: game.score,
        pieceNumber: game.pieceIndex,
        linesCleared: game.lines,
        state: game.grid,
    });

    spawnPiece();
};

const gravityStep = () => {
    if (!movePiece(0, 1)) {
        lockPiece();
    }
};

const performAction = (action) => {
    if (game.state !== PLAY_STATE.PLAYING || !game.piece) {
        return;
    }
    switch (action) {
        case 'left':
            movePiece(-1, 0);
            break;
        case 'right':
            movePiece(1, 0);
            break;
        case 'down':
            softDrop();
            break;
        case 'rotateCW':
            rotatePiece(true);
            break;
        case 'rotateCCW':
            rotatePiece(false);
            break;
        case 'hardDrop':
            hardDrop();
            break;
    }
};

// ---------- Game flow ----------

let countdownTimer;

const startPlaying = () => {
    clearInterval(countdownTimer);
    game.state = PLAY_STATE.PLAYING;
    game.serverStatus = GAME_STATUS.IN_PROGRESS;
    hideOverlay();
    renderPlayers();
    if (!game.piece) {
        spawnPiece();
    }
};

const startCountdown = () => {
    game.state = PLAY_STATE.COUNTDOWN;
    game.serverStatus = GAME_STATUS.IN_PROGRESS;
    renderPlayers();

    let remaining = TETRIS_START_COUNTDOWN;
    showOverlay({ title: String(remaining), text: 'Get ready!', countdown: true });
    countdownTimer = setInterval(() => {
        remaining--;
        if (remaining > 0) {
            showOverlay({ title: String(remaining), text: 'Get ready!', countdown: true });
        } else {
            startPlaying();
        }
    }, 1000);
};

const createNewGame = async (e) => {
    e.target.disabled = true;
    try {
        const newGame = await api('POST', '/api/game');
        window.location = `/game/${encodeURIComponent(newGame.gameId)}`;
    } catch (err) {
        e.target.disabled = false;
        showToast(err.message);
    }
};

const showGameOver = () => {
    const ranked = [...players.values()].sort((a, b) => (b.score || 0) - (a.score || 0));
    const rank = ranked.findIndex((p) => p.username === userDetails.username) + 1;
    const stillPlaying = ranked.filter((p) => !p.gameOver && p.active !== false).length;
    const rankText = ranked.length > 1 ? ` · Rank #${rank} of ${ranked.length}` : '';
    const waitingText = stillPlaying ? ` · ${stillPlaying} still playing` : '';

    showOverlay({
        title: 'Game over',
        text: `Score ${game.score.toLocaleString()} · ${game.lines} lines${rankText}${waitingText}`,
        actions: [
            { label: 'New game', onClick: createNewGame, primary: true },
            { label: 'Back to lobby', href: '/' },
        ],
    });
};

const endGame = () => {
    game.state = PLAY_STATE.OVER;
    game.piece = null;
    updateOwnPlayer();
    showGameOver();
    socket.emit(EVENTS.GAME_OVER, { score: game.score });
};

const showWaiting = () => {
    const isOwner = game.owner === userDetails.username;
    const count = players.size;
    const playersText = `${count} player${count === 1 ? '' : 's'} in the room.`;
    if (isOwner) {
        showOverlay({
            title: 'Ready?',
            text: `${playersText} Share the invite link, then start when everyone has joined.`,
            actions: [
                {
                    label: 'Start game',
                    primary: true,
                    onClick: (e) => {
                        e.target.disabled = true;
                        socket.emit(EVENTS.START_GAME);
                    },
                },
            ],
        });
    } else {
        showOverlay({
            title: 'Waiting for host',
            text: `${playersText} ${game.owner} will start the game soon.`,
        });
    }
};

// ---------- Server events ----------

const onGameData = ({ gameData, currentPlayers = [] }) => {
    game.requestingPieces = false;
    game.owner = gameData.owner;
    if (gameData.tSequence && gameData.tSequence.length > game.sequence.length) {
        game.sequence = gameData.tSequence;
    }
    const serverStatus = gameData.status || GAME_STATUS.WAITING;
    if (serverStatus !== GAME_STATUS.WAITING) {
        game.serverStatus = serverStatus;
    }

    players.clear();
    currentPlayers.forEach((player) => player && players.set(player.username, player));
    const me = players.get(userDetails.username) || {};

    if (!game.initialized) {
        game.initialized = true;
        game.score = me.score || 0;
        game.lines = me.linesCleared || 0;
        game.level = getLevel(game.lines);
        game.pieceIndex = me.numberOfPieces || 0;
        game.grid = isValidGrid(me.state) ? me.state : createNewTetrisGrid();
        updateStats();

        if (me.gameOver) {
            game.state = PLAY_STATE.OVER;
            renderPlayers();
            showGameOver();
            return;
        }
        if (serverStatus === GAME_STATUS.COMPLETED) {
            game.state = PLAY_STATE.OVER;
            renderPlayers();
            showOverlay({
                title: 'Game finished',
                text: 'Everyone in this game is already out.',
                actions: [
                    { label: 'New game', onClick: createNewGame, primary: true },
                    { label: 'Back to lobby', href: '/' },
                ],
            });
            return;
        }
        game.state = PLAY_STATE.WAITING;
    } else if (game.state !== PLAY_STATE.WAITING) {
        // reconnected mid game: keep the local board and just refresh the players
        updateOwnPlayer();
        return;
    }

    renderPlayers();
    if (serverStatus === GAME_STATUS.IN_PROGRESS) {
        startPlaying();
    } else {
        showWaiting();
    }
};

const onStartGame = () => {
    if (game.state === PLAY_STATE.WAITING) {
        startCountdown();
    }
};

const onPlayerUpdate = (data) => {
    if (!data || data.username === userDetails.username) {
        return;
    }
    setPlayerData(data);
    if (game.state === PLAY_STATE.WAITING) {
        showWaiting();
    }
};

const onGameOver = (data) => {
    onPlayerUpdate(data);
    if (data && data.username !== userDetails.username) {
        showToast(`${data.username} is out!`);
    }
    if (game.state === PLAY_STATE.OVER) {
        showGameOver();
    }
};

const onGameNotFound = () => {
    game.state = PLAY_STATE.OVER;
    setConnection(false, 'Not connected');
    showOverlay({
        title: 'Game not found',
        text: 'This game does not exist or the link is incorrect.',
        actions: [{ label: 'Back to lobby', href: '/', primary: true }],
    });
};

// ---------- Input ----------

// action -> { elapsed, charged } for actions that auto repeat while held
const heldActions = new Map();

const pressAction = (action) => {
    if (TETRIS_REPEATABLE_ACTIONS.includes(action)) {
        if (heldActions.has(action)) {
            return;
        }
        // pressing one direction cancels the other
        if (action === 'left') heldActions.delete('right');
        if (action === 'right') heldActions.delete('left');
        heldActions.set(action, { elapsed: 0, charged: false });
    }
    performAction(action);
};

const releaseAction = (action) => heldActions.delete(action);

const updateHeldActions = (dt) => {
    heldActions.forEach((held, action) => {
        held.elapsed += dt;
        const wait = () =>
            action === 'down'
                ? TETRIS_INPUT.SOFT_DROP
                : held.charged
                  ? TETRIS_INPUT.ARR
                  : TETRIS_INPUT.DAS;
        while (held.elapsed >= wait()) {
            held.elapsed -= wait();
            held.charged = true;
            performAction(action);
        }
    });
};

const getKeyAction = (e) => TETRIS_KEY_ACTIONS[e.key.length === 1 ? e.key.toLowerCase() : e.key];

document.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey || e.altKey) {
        return;
    }
    const action = getKeyAction(e);
    if (!action) {
        return;
    }
    e.preventDefault();
    if (!e.repeat) {
        pressAction(action);
    }
});

document.addEventListener('keyup', (e) => {
    const action = getKeyAction(e);
    if (action) {
        releaseAction(action);
    }
});

window.addEventListener('blur', () => heldActions.clear());

document.querySelectorAll('#touchControls button').forEach((button) => {
    const action = button.dataset.action;
    button.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        button.setPointerCapture(e.pointerId);
        pressAction(action);
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((type) =>
        button.addEventListener(type, () => releaseAction(action))
    );
    button.addEventListener('contextmenu', (e) => e.preventDefault());
});

// ---------- Invite ----------

el.inviteLink.value = window.location.href;
el.inviteLink.addEventListener('focus', () => el.inviteLink.select());
el.copyInvite.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(el.inviteLink.value);
    } catch (err) {
        el.inviteLink.select();
        document.execCommand('copy');
    }
    el.copyInvite.textContent = 'Copied!';
    setTimeout(() => (el.copyInvite.textContent = 'Copy'), 1500);
});

// ---------- Main loop ----------

const frame = (time) => {
    // clamp so a backgrounded tab does not drop a burst of rows when it comes back
    const dt = Math.min(time - (game.lastFrame || time), 100);
    game.lastFrame = time;

    if (game.state === PLAY_STATE.PLAYING && game.piece) {
        updateHeldActions(dt);
        game.dropTimer += dt;
        if (game.piece && game.dropTimer >= getDelay(game.level)) {
            game.dropTimer = 0;
            gravityStep();
        }
    }

    drawBoard(el.board, game.grid, game.piece, { dim: game.state === PLAY_STATE.OVER });
    // before the first piece spawns the preview starts at the piece about to be played
    const previewStart = game.piece ? game.pieceIndex + 1 : game.pieceIndex;
    const preview =
        game.state === PLAY_STATE.OVER
            ? []
            : game.sequence.slice(previewStart, previewStart + TETRIS_PREVIEW_COUNT).split('');
    drawPreview(el.next, preview);
    requestAnimationFrame(frame);
};

if (userDetails) {
    requestAnimationFrame(frame);
}
