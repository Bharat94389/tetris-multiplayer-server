export default {
    SECRET_KEY: String(process.env.SECRET_KEY),
    GAME_CONSTANTS: {
        GAME_OVER: 'game_over',
        PIECES: {
            L: 'l',
            S: 's',
            Z: 'z',
            T: 't',
            RL: 'rl',
            O: 'o',
            I: 'i',
        },
    },
    COLLECTIONS: {
        USER: 'Users',
        GAME: 'Games',
    },
    SOCKET_EVENTS: {
        START_GAME: 'START_GAME',
        NEXT_PIECE: 'NEXT_PIECE',
        GAME_OVER: 'GAME_OVER'
    }
};
