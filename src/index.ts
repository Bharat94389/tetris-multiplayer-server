import dotenv from 'dotenv';
dotenv.config();

import { logger } from './utils';
import database from './database';
import Server from './server';

const main = async () => {
    try {
        await database.connectAsync();

        new Server({
            port: Number(process.env.PORT) || 3000,
        });
    } catch (err: any) {
        logger.error(err.message, err.stack);
    }
};

main();
