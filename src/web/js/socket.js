// data setup
const gameId = window.location.pathname.split('/').splice(-1)[0];

// socket setup
const socket = io('/', { auth: { token: localStorage.getItem('jwt') }, query: { gameId } });
socket.on('connect', () => console.log('Connected to server'));
socket.on('disconnect', () => console.log('Disconnected from server'));

const EVENTS = {
    NEW_GAME: 'NEW_GAME',
    START_GAME: 'START_GAME',
    NEXT_PIECE: 'NEXT_PIECE',
    SCORE_UPDATE: 'SCORE_UPDATE',
    GAME_OVER: 'GAME_OVER',
    GAME_DATA: 'GAME_DATA',
    PLAYER_JOINED: 'PLAYER_JOINED',
    PLAYER_LEFT: 'PLAYER_LEFT',
};

socket.on(EVENTS.GAME_DATA, (data) => {
    gameData = data.gameData;
    // Add start button if user is game owner
    if (gameData.owner === userDetails.username) {
        document.getElementById('startButton')?.remove();
        const button = document.createElement('button');
        button.id = 'startButton';
        button.innerHTML = 'Start Game';
        button.addEventListener('click', () => socket.emit(EVENTS.START_GAME));
        document.getElementById('gameContainer').appendChild(button);
    } else {
        document.getElementById('info-box')?.remove();
        const div = document.createElement('div');
        div.id = 'info-box';
        div.innerHTML = 'Waiting for owner to start the game';
        document.getElementById('gameContainer').appendChild(div);
    }

    // add players to leaderboard
    const leaderboard = document.getElementById('leaderboard');
    leaderboard.innerHTML = '';
    data.currentPlayers.forEach((player) => setPlayerData(player));

    playerData = data.currentPlayers.find((p) => p.username === userDetails.username);

    // initialize the game
    init();
});

socket.on(EVENTS.PLAYER_JOINED, (data) => setPlayerData(data));

socket.on(EVENTS.PLAYER_LEFT, (data) => setPlayerData(data));
