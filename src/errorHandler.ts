import { Logger } from './utils';

process.on('unhandledRejection', (error: Error) => {
    Logger.error(error.message, error.stack);
    throw error;
});

process.on('uncaughtException', (error: Error) => {
    Logger.error(error.message, error.stack);
    throw error;
});
