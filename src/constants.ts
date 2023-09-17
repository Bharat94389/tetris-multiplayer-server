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
};
