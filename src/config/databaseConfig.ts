const databaseConfig = {
    options: {
        appName: 'tetris-multiplayer',
        minPoolSize: 2,
    },
    dbName: 'tetris-multiplayer',
    connectionUrl: process.env.CONNECTION_URL ?
        String(process.env.CONNECTION_URL) :
        'mongodb://localhost:27017',
};

export default databaseConfig;
