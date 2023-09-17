import dotenv from 'dotenv';
dotenv.config();

import { databaseConfig } from './config';
import { logger } from './utils';
import Database from './database';
import Server from './server';

const main = async () => {
    const database: Database = new Database({
        connectionUrl: databaseConfig.connectionUrl,
        options: databaseConfig.options,
        dbName: databaseConfig.dbName,
    });

    try {
        await database.connectAsync();

        new Server({
            port: Number(process.env.PORT) || 3000,
            database,
        });
    } catch (err: any) {
        logger.error(err.message, err.stack);
    }
};

main();
