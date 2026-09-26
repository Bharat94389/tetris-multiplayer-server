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
    SPECTATOR: 'SPECTATOR',
    BANNED: 'BANNED',
} as const;

export const ROLES = {
    PLAYER: 'player',
    SPECTATOR: 'spectator',
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
    SPECTATOR_JOINED: 'SPECTATOR_JOINED',
    SPECTATOR_LEFT: 'SPECTATOR_LEFT',
    CHANGE_ROLE: 'CHANGE_ROLE',
    ROLE_CHANGED: 'ROLE_CHANGED',
    KICK_USER: 'KICK_USER',
    USER_KICKED: 'USER_KICKED',
    PIECE_UPDATE: 'PIECE_UPDATE',
} as const;

export const HTTP_STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    UNAUTHORIZED: 401,
    BAD_REQUEST: 400,
    UNEXPECTED: 500
} as const;
