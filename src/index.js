const dotenv = require('dotenv');
const config = require('./config');
const Database = require('./database');
const Server = require('./server');

dotenv.config();

const main = async () => {
    const database = new Database({
        connectionUrl: process.env.CONNECTION_URL,
        databaseOptions: config.databaseConfig.options,
        databaseName: config.databaseConfig.databaseName,
    });

    await database.connectAsync();

    const server = new Server({
        port: process.env.PORT || 3000,
        database,
    });
};

main();
