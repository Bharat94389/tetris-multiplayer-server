const dotenv = require('dotenv');
dotenv.config();

// const config = require('./config');
// const Database = require('./database');
const Server = require('./server');
const { logger } = require('./utils');

const main = async () => {
    // const database = new Database({
    //     connectionUrl: process.env.CONNECTION_URL,
    //     databaseOptions: config.databaseConfig.options,
    //     databaseName: config.databaseConfig.databaseName,
    //     logger,
    // });

    try {
        // await database.connectAsync();

        const server = new Server({
            port: process.env.PORT || 3000,
            // database,
            secretKey: process.env.SECRET_KEY,
        });
    } catch (err) {
        logger.error(err);
    }
};

main();
