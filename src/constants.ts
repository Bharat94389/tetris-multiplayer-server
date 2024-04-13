export const GAME_CONSTANTS = {
    GAME_OVER: 'GAME_OVER',
    PIECES: {
        L: 'l',
        S: 's',
        Z: 'z',
        T: 't',
        J: 'j',
        O: 'o',
        I: 'i',
    },
};

export const CACHE = {
    GAME: 'GAME' as const,
    PLAYER: 'PLAYER' as const,
};

export const GAME_STATUS = {
    IN_PROGRESS: 'IN_PROGRESS' as const,
    COMPLETED: 'COMPLETED' as const,
    WAITING: 'WAITING' as const,
};

export const COLLECTIONS = {
    USER: 'Users' as const,
    GAME: 'Games' as const,
    PLAYER_STATS: 'PlayerStats' as const,
};

export const GAME_EVENTS = {
    START_GAME: 'START_GAME',
    NEXT_PIECE: 'NEXT_PIECE',
    GAME_OVER: 'GAME_OVER',
    GAME_DATA: 'GAME_DATA',
    PLAYER_JOINED: 'PLAYER_JOINED',
    PLAYER_LEFT: 'PLAYER_LEFT',
    SCORE_UPDATE: 'SCORE_UPDATE',
};
