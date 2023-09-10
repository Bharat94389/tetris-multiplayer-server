import dotenv from 'dotenv';
dotenv.config();

import { databaseConfig } from './config';
import { logger } from './utils';
import Database from './database';
import Server from './server';

const main = async () => {
    const database: Database = new Database({
        connectionUrl: String(process.env.CONNECTION_URL),
        options: databaseConfig.options,
        dbName: databaseConfig.dbName,
    });

    try {
        await database.connectAsync();

        new Server({
            port: Number(process.env.PORT) || 3000,
            database,
        });
    } catch (err) {
        logger.error(err.message, err.stack);
    }
};

main();
