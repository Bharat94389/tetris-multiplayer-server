// Loaded last: wires the socket events to the game in game.js
const EVENTS = {
    START_GAME: 'START_GAME',
    NEXT_PIECE: 'NEXT_PIECE',
    SCORE_UPDATE: 'SCORE_UPDATE',
    GAME_OVER: 'GAME_OVER',
    GAME_DATA: 'GAME_DATA',
    PLAYER_JOINED: 'PLAYER_JOINED',
    PLAYER_LEFT: 'PLAYER_LEFT',
    GAME_NOT_FOUND: 'GAME_NOT_FOUND',
};

const socket = io('/', {
    autoConnect: Boolean(userDetails),
    auth: { token: getToken() },
    query: { gameId },
});

socket.on('connect', () => setConnection(true, 'Connected'));

socket.on('disconnect', (reason) => {
    // the server closes the connection itself only when the game does not exist
    if (reason !== 'io server disconnect') {
        setConnection(false, 'Reconnecting…');
    }
});

socket.on('connect_error', (err) => {
    if (/authorization/i.test(err.message)) {
        return logout();
    }
    setConnection(false, 'Connection failed');
});

socket.on(EVENTS.GAME_DATA, onGameData);
socket.on(EVENTS.START_GAME, onStartGame);
socket.on(EVENTS.NEXT_PIECE, onNextPieces);
socket.on(EVENTS.PLAYER_JOINED, onPlayerUpdate);
socket.on(EVENTS.PLAYER_LEFT, onPlayerUpdate);
socket.on(EVENTS.SCORE_UPDATE, onPlayerUpdate);
socket.on(EVENTS.GAME_OVER, onGameOver);
socket.on(EVENTS.GAME_NOT_FOUND, onGameNotFound);
