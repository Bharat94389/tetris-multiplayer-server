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
} as const;

export const CACHE = {
    GAME: 'GAME',
    PLAYER: 'PLAYER',
} as const;

export const GAME_STATUS = {
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    WAITING: 'WAITING',
} as const;

export const COLLECTIONS = {
    USER: 'Users',
    GAME: 'Games',
    PLAYER_STATS: 'PlayerStats',
} as const;

export const GAME_EVENTS = {
    START_GAME: 'START_GAME',
    NEXT_PIECE: 'NEXT_PIECE',
    GAME_OVER: 'GAME_OVER',
    GAME_DATA: 'GAME_DATA',
    PLAYER_JOINED: 'PLAYER_JOINED',
    PLAYER_LEFT: 'PLAYER_LEFT',
    SCORE_UPDATE: 'SCORE_UPDATE',
} as const;
