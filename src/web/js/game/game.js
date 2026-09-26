const gameId = decodeURIComponent(window.location.pathname.split('/').filter(Boolean).pop() || '');

const GAME_STATUS = {
    IN_PROGRESS: 'IN_PROGRESS',
    WAITING: 'WAITING',
    COMPLETED: 'COMPLETED',
};

const ROLES = {
    PLAYER: 'player',
    SPECTATOR: 'spectator',
};

// Local status of this player's game
const PLAY_STATE = {
    LOADING: 'loading',
    WAITING: 'waiting',
    COUNTDOWN: 'countdown',
    PLAYING: 'playing',
    // a spectator watching a game that has started
    WATCHING: 'watching',
    OVER: 'over',
};

const game = {
    state: PLAY_STATE.LOADING,
    initialized: false,
    owner: null,
    role: ROLES.SPECTATOR,
    // username of the player shown on the board while watching
    watching: null,
    // the game over overlay was closed to watch the players still in the game
    overlayDismissed: false,
    serverStatus: GAME_STATUS.WAITING,
    sequence: '',
    grid: createNewTetrisGrid(),
    piece: null,
    pieceIndex: 0,
    score: 0,
    lines: 0,
    level: 0,
    dropTimer: 0,
    // rows moved by the current soft drop, scored when the piece locks
    softDropRows: 0,
    awaitingPiece: false,
    requestingPieces: false,
    lastSequenceRequest: 0,
    // the falling piece changed since it was last sent to the spectators
    pieceDirty: false,
    lastPieceSent: 0,
    lastFrame: 0,
};

// username -> player stats as sent by the server
const players = new Map();
// username -> { username, active }
const spectators = new Map();
// username -> falling piece of the players, streamed to the watchers
const livePieces = new Map();

const EMPTY_GRID = createNewTetrisGrid();

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
    spectatorList: document.getElementById('spectatorList'),
    spectatorCount: document.getElementById('spectatorCount'),
    watchBadge: document.getElementById('watchBadge'),
    hostMenu: document.getElementById('hostMenu'),
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
    actions.forEach(({ label, onClick, primary, href, disabled }) => {
        const button = document.createElement(href ? 'a' : 'button');
        button.className = `btn ${primary ? 'btn-primary' : ''}`;
        button.textContent = label;
        button.disabled = Boolean(disabled);
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

const isMe = (username) => username === userDetails.username;

const isOwner = () => isMe(game.owner);

// Spectators and players who are out watch the players still in the game
const isWatcher = () => game.role === ROLES.SPECTATOR || game.state === PLAY_STATE.OVER;

const isStillIn = (player) => !player.gameOver && player.active !== false;

const byScore = (a, b) => (b.score || 0) - (a.score || 0);

const getWatchedPlayer = () => (isWatcher() && players.get(game.watching)) || null;

// Keeps watching the same player, unless they left the game or `force` is set (they are out),
// then switches to the best player still in the game
const updateWatching = (force = false) => {
    if (!isWatcher()) {
        game.watching = null;
        return;
    }
    const current = players.get(game.watching);
    if (current && !force) {
        return;
    }
    const ranked = [...players.values()].sort(byScore);
    const next = ranked.find(isStillIn) || current || ranked[0];
    game.watching = next ? next.username : null;
};

const updateStats = () => {
    const watched = getWatchedPlayer();
    const score = watched ? watched.score || 0 : game.score;
    const lines = watched ? watched.linesCleared || 0 : game.lines;
    el.score.textContent = score.toLocaleString();
    el.level.textContent = watched ? getLevel(lines) : game.level;
    el.lines.textContent = lines;
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

const changeRole = (role, username) => socket.emit(EVENTS.CHANGE_ROLE, { role, username });

// user the host menu is open for, as { username, role }
let hostMenuTarget = null;

const canManage = (username, role) =>
    isOwner() &&
    !isMe(username) &&
    game.serverStatus === GAME_STATUS.WAITING &&
    (role === ROLES.PLAYER ? players : spectators).has(username);

// Button that opens the menu for the host to move or remove a user before the game starts
const createHostMenuButton = (username, role) => {
    if (!canManage(username, role)) {
        return null;
    }
    const open = hostMenuTarget && hostMenuTarget.username === username;
    const button = document.createElement('button');
    button.className = `btn btn-xs host-menu-button ${open ? 'is-open' : ''}`;
    button.textContent = '⋯';
    button.dataset.action = 'menu';
    button.dataset.username = username;
    button.dataset.role = role;
    button.setAttribute('aria-label', `Options for ${username}`);
    button.setAttribute('aria-haspopup', 'menu');
    button.setAttribute('aria-expanded', String(Boolean(open)));
    return button;
};

const closeHostMenu = () => {
    if (!hostMenuTarget) {
        return;
    }
    hostMenuTarget = null;
    el.hostMenu.classList.add('hidden');
    document.querySelectorAll('.host-menu-button.is-open').forEach((button) => {
        button.classList.remove('is-open');
        button.setAttribute('aria-expanded', 'false');
    });
};

const kickUser = (username) => {
    const message = `Remove ${username} from this game? They will not be able to join it again.`;
    if (window.confirm(message)) {
        socket.emit(EVENTS.KICK_USER, { username });
    }
};

const openHostMenu = (button) => {
    const { username, role } = button.dataset;
    if (hostMenuTarget && hostMenuTarget.username === username) {
        closeHostMenu();
        return;
    }
    closeHostMenu();
    hostMenuTarget = { username, role };
    button.classList.add('is-open');
    button.setAttribute('aria-expanded', 'true');

    const toPlayer = role === ROLES.SPECTATOR;
    const items = [
        {
            label: toPlayer ? 'Move to players' : 'Move to spectators',
            onClick: () => changeRole(toPlayer ? ROLES.PLAYER : ROLES.SPECTATOR, username),
        },
        { label: 'Kick', danger: true, onClick: () => kickUser(username) },
    ];
    el.hostMenu.innerHTML = '';
    items.forEach(({ label, danger, onClick }) => {
        const item = document.createElement('button');
        item.className = `host-menu-item ${danger ? 'is-danger' : ''}`;
        item.textContent = label;
        item.setAttribute('role', 'menuitem');
        item.addEventListener('click', () => {
            closeHostMenu();
            onClick();
        });
        el.hostMenu.appendChild(item);
    });

    // below the button and aligned to its right edge, above it when there is no room
    el.hostMenu.classList.remove('hidden');
    const anchor = button.getBoundingClientRect();
    const menu = el.hostMenu.getBoundingClientRect();
    const left = Math.min(anchor.right - menu.width, window.innerWidth - menu.width - 8);
    let top = anchor.bottom + 4;
    if (top + menu.height > window.innerHeight - 8) {
        top = anchor.top - menu.height - 4;
    }
    el.hostMenu.style.left = `${Math.max(8, left)}px`;
    el.hostMenu.style.top = `${Math.max(8, top)}px`;
    el.hostMenu.querySelector('button').focus();
};

document.addEventListener('click', (e) => {
    if (!e.target.closest('#hostMenu, [data-action="menu"]')) {
        closeHostMenu();
    }
});
document.addEventListener('keydown', (e) => e.key === 'Escape' && closeHostMenu());
// the menu is positioned for where the button was
window.addEventListener('resize', closeHostMenu);
window.addEventListener('scroll', closeHostMenu, true);

const getHostChip = (username) =>
    username === game.owner ? '<span class="chip chip-host">Host</span>' : '';

const renderPlayers = () => {
    const sorted = [...players.values()].sort(byScore);
    const watchable = isWatcher() && game.serverStatus !== GAME_STATUS.WAITING;
    el.playerList.innerHTML = '';
    if (!sorted.length) {
        el.playerList.innerHTML = '<li class="empty-list">No players yet</li>';
    }
    sorted.forEach((player, index) => {
        const me = isMe(player.username);
        const status = getPlayerStatus(player);
        const li = document.createElement('li');
        li.className = [
            'player',
            me && 'is-me',
            player.gameOver && 'is-out',
            watchable && 'is-watchable',
            watchable && player.username === game.watching && 'is-watching',
        ]
            .filter(Boolean)
            .join(' ');
        li.dataset.username = player.username;
        li.innerHTML = `
            <span class="player-rank">${index + 1}</span>
            <div class="player-info">
                <div class="player-name">
                    <span>${escapeHtml(player.username)}${me ? ' (you)' : ''}</span>
                    ${getHostChip(player.username)}
                </div>
                <div class="player-meta">
                    <span class="dot ${getDotClass(player)}"></span>
                    <span>${status}</span>
                    <span>· ${player.linesCleared || 0} lines</span>
                </div>
            </div>`;
        // every score is 0 before the game starts, so the host menu takes its place
        const menuButton = createHostMenuButton(player.username, ROLES.PLAYER);
        if (menuButton) {
            li.appendChild(menuButton);
        } else {
            const score = document.createElement('span');
            score.className = 'player-score';
            score.textContent = (player.score || 0).toLocaleString();
            li.appendChild(score);
        }
        el.playerList.appendChild(li);
    });
};

const renderSpectators = () => {
    el.spectatorCount.textContent = spectators.size ? `· ${spectators.size}` : '';
    el.spectatorList.innerHTML = '';
    if (!spectators.size) {
        el.spectatorList.innerHTML = '<li class="empty-list">No one is watching</li>';
        return;
    }
    const sorted = [...spectators.values()].sort((a, b) => a.username.localeCompare(b.username));
    sorted.forEach((spectator) => {
        const me = isMe(spectator.username);
        const online = spectator.active !== false;
        const li = document.createElement('li');
        li.className = `player spectator ${me ? 'is-me' : ''}`;
        li.innerHTML = `
            <div class="player-info">
                <div class="player-name">
                    <span>${escapeHtml(spectator.username)}${me ? ' (you)' : ''}</span>
                    ${getHostChip(spectator.username)}
                </div>
                <div class="player-meta">
                    <span class="dot ${online ? 'dot-online' : 'dot-offline'}"></span>
                    <span>${online ? 'Watching' : 'Offline'}</span>
                </div>
            </div>`;
        const menuButton = createHostMenuButton(spectator.username, ROLES.SPECTATOR);
        if (menuButton) {
            li.appendChild(menuButton);
        }
        el.spectatorList.appendChild(li);
    });
};

const renderWatchView = () => {
    const watched = getWatchedPlayer();
    document.body.classList.toggle('is-watcher', isWatcher());
    el.watchBadge.classList.toggle('hidden', !watched || game.serverStatus === GAME_STATUS.WAITING);
    if (watched) {
        el.watchBadge.innerHTML = `Watching <strong>${escapeHtml(watched.username)}</strong>`;
    }
    updateStats();
};

const renderRoom = () => {
    // the user the menu is for changed role or left, or the game started
    if (hostMenuTarget && !canManage(hostMenuTarget.username, hostMenuTarget.role)) {
        closeHostMenu();
    }
    updateWatching();
    renderPlayers();
    renderSpectators();
    renderWatchView();
};

const onListClick = (e) => {
    const button = e.target.closest('button[data-action="menu"]');
    if (button) {
        openHostMenu(button);
        return;
    }
    const row = e.target.closest('.player.is-watchable');
    if (row && row.dataset.username !== game.watching) {
        game.watching = row.dataset.username;
        renderRoom();
    }
};

el.playerList.addEventListener('click', onListClick);
el.spectatorList.addEventListener('click', onListClick);

const setPlayerData = (data) => {
    if (!data || !data.username) {
        return;
    }
    players.set(data.username, { ...players.get(data.username), ...data });
    renderRoom();
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
    if (game.sequence.length > game.pieceIndex + TETRIS_PIECES_BUFFER) {
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
    if (grew && !isWatcher()) {
        requestMorePieces();
    }
};

// Watchers only fetch the sequence the players have loaded to show the next piece
const requestSequence = (index, time) => {
    if (index < game.sequence.length || game.requestingPieces) {
        return;
    }
    if (time - game.lastSequenceRequest < 1000) {
        return;
    }
    game.requestingPieces = true;
    game.lastSequenceRequest = time;
    socket.emit(EVENTS.NEXT_PIECE, { pieceNumber: 0 });
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
    game.pieceDirty = true;
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
    game.pieceDirty = true;
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
        piece.rotation = (piece.rotation + (clockwise ? 1 : 3)) % 4;
        piece.x += kick[0];
        piece.y += kick[1];
        game.pieceDirty = true;
    }
};

// As in classic Tetris, soft dropping a piece that has landed locks it straight away
const softDrop = () => {
    if (movePiece(0, 1)) {
        game.softDropRows++;
        game.dropTimer = 0;
    } else {
        lockPiece();
    }
};

// Classic Tetris has no hard drop, so it is kept as a shortcut that scores no points
const hardDrop = () => {
    if (!game.piece) {
        return;
    }
    game.softDropRows = 0;
    game.piece.y = getDropY(game.grid, game.piece);
    lockPiece();
};

const lockPiece = () => {
    mergePiece(game.grid, game.piece);
    game.piece = null;

    // as in classic Tetris, 1 point for each row the piece was soft dropped without letting go
    game.score += game.softDropRows;
    game.softDropRows = 0;
    // down has to be pressed again for the next piece
    heldActions.delete('down');

    const cleared = clearLines(game.grid);
    if (cleared) {
        game.lines += cleared;
        const level = getLevel(game.lines);
        const levelUp = level > game.level;
        // as in classic Tetris, the clear that reaches a new level is scored at the new level
        game.level = level;
        const points = getLinePoints(game.level, cleared);
        game.score += points;
        showToast(levelUp ? `Level ${level}!` : `${TETRIS_LINE_NAMES[cleared]} +${points}`);
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
    renderRoom();
    if (!game.piece) {
        spawnPiece();
    }
};

const startWatching = () => {
    clearInterval(countdownTimer);
    game.state = PLAY_STATE.WATCHING;
    game.serverStatus = GAME_STATUS.IN_PROGRESS;
    hideOverlay();
    renderRoom();
};

const startCountdown = () => {
    game.state = PLAY_STATE.COUNTDOWN;
    game.serverStatus = GAME_STATUS.IN_PROGRESS;
    renderRoom();

    let remaining = TETRIS_START_COUNTDOWN;
    showOverlay({ title: String(remaining), text: 'Get ready!', countdown: true });
    countdownTimer = setInterval(() => {
        remaining--;
        if (remaining > 0) {
            showOverlay({ title: String(remaining), text: 'Get ready!', countdown: true });
        } else if (game.role === ROLES.PLAYER) {
            startPlaying();
        } else {
            startWatching();
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

const countStillIn = () => [...players.values()].filter(isStillIn).length;

const showGameOver = () => {
    const ranked = [...players.values()].sort(byScore);
    const rank = ranked.findIndex((p) => isMe(p.username)) + 1;
    const stillPlaying = countStillIn();
    const rankText = ranked.length > 1 ? ` · Rank #${rank} of ${ranked.length}` : '';
    const waitingText = stillPlaying ? ` · ${stillPlaying} still playing` : '';
    const watchAction = {
        label: 'Watch the others',
        primary: true,
        onClick: () => {
            game.overlayDismissed = true;
            hideOverlay();
        },
    };

    showOverlay({
        title: 'Game over',
        text: `Score ${game.score.toLocaleString()} · ${game.lines} lines${rankText}${waitingText}`,
        actions: [
            ...(stillPlaying ? [watchAction] : []),
            { label: 'New game', onClick: createNewGame, primary: !stillPlaying },
            { label: 'Back to lobby', href: '/' },
        ],
    });
};

const showGameFinished = () => {
    const ranked = [...players.values()].sort(byScore);
    const [winner] = ranked;
    let text = 'This game has ended.';
    if (winner) {
        const points = `${(winner.score || 0).toLocaleString()} points`;
        text =
            ranked.length > 1
                ? `${winner.username} won with ${points}.`
                : `${winner.username} finished with ${points}.`;
    }
    showOverlay({
        title: 'Game finished',
        text,
        actions: [
            { label: 'New game', onClick: createNewGame, primary: true },
            { label: 'View boards', onClick: hideOverlay },
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

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

const showWaiting = () => {
    const host = isOwner();
    const spectating = game.role === ROLES.SPECTATOR;
    const canStart = [...players.values()].some((player) => player.active !== false);
    const spectatorsText = spectators.size ? ` and ${plural(spectators.size, 'spectator')}` : '';
    const roomText = `${plural(players.size, 'player')}${spectatorsText} in the room.`;

    const actions = [];
    if (host) {
        actions.push({
            label: 'Start game',
            primary: true,
            disabled: !canStart,
            onClick: (e) => {
                e.target.disabled = true;
                socket.emit(EVENTS.START_GAME);
            },
        });
    }
    actions.push({
        label: spectating ? 'Join game' : 'Spectate instead',
        primary: spectating && !host,
        onClick: (e) => {
            e.target.disabled = true;
            changeRole(spectating ? ROLES.PLAYER : ROLES.SPECTATOR);
        },
    });

    let title = 'Waiting for host';
    let text = `${roomText} ${game.owner} will start the game soon.`;
    if (host) {
        title = 'Ready?';
        text = canStart
            ? `${roomText} Share the invite link, then start when everyone has joined.`
            : `${roomText} The game needs a player online before it can start.`;
    } else if (spectating) {
        title = 'Spectating';
        text = `${roomText} Join the game to play, or stay to watch when ${game.owner} starts it.`;
    }
    showOverlay({ title, text, actions });
};

// ---------- Server events ----------

// Loads the stats of this player, a new or spectating player starts with an empty board
const resetOwnGame = (me = {}) => {
    game.score = me.score || 0;
    game.lines = me.linesCleared || 0;
    game.level = getLevel(game.lines);
    game.pieceIndex = me.numberOfPieces || 0;
    game.grid = isValidGrid(me.state) ? me.state : createNewTetrisGrid();
    game.piece = null;
};

const onGameData = ({
    gameData,
    currentPlayers = [],
    spectators: currentSpectators = [],
    role,
}) => {
    game.requestingPieces = false;
    game.owner = gameData.owner;
    game.role = role === ROLES.PLAYER ? ROLES.PLAYER : ROLES.SPECTATOR;
    if (gameData.tSequence && gameData.tSequence.length > game.sequence.length) {
        game.sequence = gameData.tSequence;
    }
    const serverStatus = gameData.status || GAME_STATUS.WAITING;
    if (serverStatus !== GAME_STATUS.WAITING) {
        game.serverStatus = serverStatus;
    }

    players.clear();
    currentPlayers.forEach((player) => player && players.set(player.username, player));
    spectators.clear();
    currentSpectators.forEach(
        (spectator) => spectator && spectators.set(spectator.username, spectator)
    );

    if (game.role === ROLES.SPECTATOR) {
        game.initialized = true;
        resetOwnGame();
        if (serverStatus === GAME_STATUS.WAITING) {
            game.state = PLAY_STATE.WAITING;
            renderRoom();
            showWaiting();
        } else if (serverStatus === GAME_STATUS.IN_PROGRESS) {
            if (game.state !== PLAY_STATE.COUNTDOWN) {
                startWatching();
            }
        } else {
            game.state = PLAY_STATE.WATCHING;
            renderRoom();
            showGameFinished();
        }
        return;
    }

    const me = players.get(userDetails.username) || {};
    if (!game.initialized) {
        game.initialized = true;
        resetOwnGame(me);

        if (me.gameOver) {
            game.state = PLAY_STATE.OVER;
            renderRoom();
            showGameOver();
            return;
        }
        if (serverStatus === GAME_STATUS.COMPLETED) {
            game.state = PLAY_STATE.OVER;
            renderRoom();
            showGameFinished();
            return;
        }
        game.state = PLAY_STATE.WAITING;
    } else if (game.state !== PLAY_STATE.WAITING) {
        // reconnected mid game: keep the local board and just refresh the players
        updateOwnPlayer();
        return;
    }

    renderRoom();
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
    if (!data || isMe(data.username)) {
        return;
    }
    // the board sent has the falling piece locked in it
    const livePiece = livePieces.get(data.username);
    if (livePiece && (data.gameOver || livePiece.pieceNumber < (data.numberOfPieces || 0))) {
        livePieces.delete(data.username);
    }
    setPlayerData(data);
    if (game.state === PLAY_STATE.WAITING) {
        showWaiting();
    }
};

const onGameOver = (data) => {
    if (!data) {
        return;
    }
    const wasWatched = data.username === game.watching;
    onPlayerUpdate(data);
    if (!isMe(data.username)) {
        showToast(`${data.username} is out!`);
    }
    if (wasWatched) {
        updateWatching(true);
        renderRoom();
    }

    const stillPlaying = countStillIn();
    if (game.role === ROLES.PLAYER && game.state === PLAY_STATE.OVER) {
        // the results are shown again once the last player is out
        if (!game.overlayDismissed || !stillPlaying) {
            showGameOver();
        }
    } else if (game.role === ROLES.SPECTATOR && !stillPlaying) {
        showGameFinished();
    }
};

const onSpectatorUpdate = (data) => {
    if (!data || !data.username) {
        return;
    }
    spectators.set(data.username, { ...spectators.get(data.username), ...data });
    renderRoom();
    if (game.state === PLAY_STATE.WAITING) {
        showWaiting();
    }
};

const onRoleChanged = ({ username, role, player, spectator } = {}) => {
    if (!username) {
        return;
    }
    if (role === ROLES.PLAYER) {
        spectators.delete(username);
        players.set(username, player || { username });
    } else {
        players.delete(username);
        livePieces.delete(username);
        spectators.set(username, spectator || { username });
    }
    if (isMe(username)) {
        game.role = role === ROLES.PLAYER ? ROLES.PLAYER : ROLES.SPECTATOR;
        // roles only change before the game starts, so there is no progress to keep
        resetOwnGame();
        showToast(game.role === ROLES.PLAYER ? 'You are playing' : 'You are spectating');
    }
    if (username === game.watching) {
        game.watching = null;
    }
    renderRoom();
    if (game.state === PLAY_STATE.WAITING) {
        showWaiting();
    }
};

const onUserKicked = ({ username } = {}) => {
    if (isMe(username)) {
        clearInterval(countdownTimer);
        game.state = PLAY_STATE.OVER;
        game.piece = null;
        setConnection(false, 'Not connected');
        showOverlay({
            title: 'Removed from game',
            text: 'The host removed you from this game.',
            actions: [{ label: 'Back to lobby', href: '/', primary: true }],
        });
        return;
    }
    players.delete(username);
    spectators.delete(username);
    livePieces.delete(username);
    if (username === game.watching) {
        game.watching = null;
    }
    renderRoom();
    if (game.state === PLAY_STATE.WAITING) {
        showWaiting();
    }
};

const onPieceUpdate = ({ username, piece } = {}) => {
    const player = players.get(username);
    if (!player || player.gameOver || !piece) {
        return;
    }
    // drop updates of a piece that is already locked in the board
    if (piece.pieceNumber < (player.numberOfPieces || 0)) {
        return;
    }
    const livePiece = pieceFromUpdate(piece);
    if (livePiece) {
        livePieces.set(username, { ...livePiece, pieceNumber: piece.pieceNumber });
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

const releaseAction = (action) => {
    heldActions.delete(action);
    if (action === 'down') {
        // letting go of soft drop resets its points
        game.softDropRows = 0;
    }
};

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

// Sends the falling piece to the watchers, at most once every TETRIS_PIECE_UPDATE_MS
const sendPieceUpdate = (time) => {
    if (!game.pieceDirty || !game.piece || time - game.lastPieceSent < TETRIS_PIECE_UPDATE_MS) {
        return;
    }
    const hasWatchers =
        [...spectators.values()].some((spectator) => spectator.active !== false) ||
        [...players.values()].some((player) => player.gameOver && player.active !== false);
    if (!hasWatchers) {
        return;
    }
    game.pieceDirty = false;
    game.lastPieceSent = time;
    const { type, rotation, x, y } = game.piece;
    socket.emit(EVENTS.PIECE_UPDATE, { type, rotation, x, y, pieceNumber: game.pieceIndex });
};

const drawWatched = (watched, time) => {
    // a player who is out and watching their own board has it locally
    const ownBoard = isMe(watched.username) && game.role === ROLES.PLAYER;
    const grid = ownBoard ? game.grid : isValidGrid(watched.state) ? watched.state : EMPTY_GRID;
    const livePiece = watched.gameOver ? null : livePieces.get(watched.username);
    drawBoard(el.board, grid, livePiece, { showGhost: false, dim: Boolean(watched.gameOver) });

    const nextIndex = livePiece ? livePiece.pieceNumber + 1 : watched.numberOfPieces || 0;
    drawPreview(el.next, watched.gameOver ? null : game.sequence[nextIndex]);
    if (!watched.gameOver) {
        requestSequence(nextIndex, time);
    }
};

const frame = (time) => {
    // clamp so a backgrounded tab does not drop a burst of rows when it comes back
    const dt = Math.min(time - (game.lastFrame || time), 100);
    game.lastFrame = time;

    if (game.state === PLAY_STATE.PLAYING && game.piece) {
        updateHeldActions(dt);
        game.dropTimer += dt;
        const delay = getDelay(game.level);
        if (game.piece && game.dropTimer >= delay) {
            // keep the leftover time so the fall speed matches the gravity table
            game.dropTimer = Math.min(game.dropTimer - delay, delay);
            gravityStep();
        }
        sendPieceUpdate(time);
    }

    const watched = getWatchedPlayer();
    if (watched) {
        drawWatched(watched, time);
    } else {
        drawBoard(el.board, game.grid, game.piece, { dim: game.state === PLAY_STATE.OVER });
        // before the first piece spawns the preview shows the piece about to be played
        const nextIndex = game.piece ? game.pieceIndex + 1 : game.pieceIndex;
        drawPreview(el.next, game.state === PLAY_STATE.OVER ? null : game.sequence[nextIndex]);
    }
    requestAnimationFrame(frame);
};

if (userDetails) {
    requestAnimationFrame(frame);
}
