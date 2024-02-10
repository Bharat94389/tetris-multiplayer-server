export const GAME_CONSTANTS = {
    GAME_OVER: 'GAME_OVER',
    PIECES: {
        L: 'l',
        S: 's',
        Z: 'z',
        T: 't',
        RL: 'rl',
        O: 'o',
        I: 'i',
    },
};

export const GAME_STATUS = {
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    WAITING: 'WAITING',
};

export const COLLECTIONS = {
    USER: 'Users',
    GAME: 'Games',
    PLAYER_STATS: 'PlayerStats',
};

export const SOCKET_EVENTS = {
    START_GAME: 'START_GAME',
    NEXT_PIECE: 'NEXT_PIECE',
    GAME_OVER: 'GAME_OVER',
};
