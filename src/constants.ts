export const GAME_CONSTANTS = {
    GAME_OVER: 'GAME_OVER',
    ROWS: 20,
    COLS: 10,
    // number of pieces added to the sequence at a time
    PIECES_BATCH_SIZE: 5,
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
    SEQUENCE: 'SEQUENCE',
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
    GAME_NOT_FOUND: 'GAME_NOT_FOUND',
} as const;

export const HTTP_STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    UNAUTHORIZED: 401,
    BAD_REQUEST: 400,
    UNEXPECTED: 500
} as const;
