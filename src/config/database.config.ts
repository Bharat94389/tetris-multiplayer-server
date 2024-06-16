export const databaseConfig = {
    options: {
        appName: 'tetris-multiplayer',
        minPoolSize: 2,
    },
    dbName: 'tetris-multiplayer',
    connectionUrl: String(process.env.CONNECTION_URL),
};
