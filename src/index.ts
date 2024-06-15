import dotenv from 'dotenv';
dotenv.config();

// import errorHandler to log unhandled errors
import './errorHandler';

import { Server } from './server';
import { Logger } from './utils';
import { ServicesEnum, createContainer } from './ioc/createContainer';
import { serverConfig } from './config';
import { IDatabase } from './database';

const main = async () => {
    try {
        const container = createContainer();

        const database: IDatabase = container[ServicesEnum.database];
        await database.connectAsync();

        new Server(container, serverConfig);
    } catch (err: any) {
        Logger.error(err.message, err.stack);
    }
};

main();
