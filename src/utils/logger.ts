import { createLogger, format, transports } from 'winston';
import { WinstonLogger } from '../types';

class Logger {
    logger: WinstonLogger;

    constructor() {
        this.logger = createLogger({
            format: format.combine(format.timestamp(), format.json({ space: 0 })),
            transports: [new transports.Console()],
        });
    }

    info(message: string, args: Object | undefined = undefined): void {
        if (args) {
            this.logger.info(message, args);
        } else {
            this.logger.info(message);
        }
    }

    error(message: string, stack: any): void {
        this.logger.error(message, { stack });
    }
}

export default new Logger();
