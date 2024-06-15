import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';

export class Logger {
    static logger: WinstonLogger = createLogger({
        format: format.combine(format.timestamp(), format.json({ space: 0 })),
        transports: [new transports.Console()],
    });

    static info(message: string, args = {}): void {
        this.logger.info(message, args);
    }

    static error(message: string, stack: any): void {
        this.logger.error(message, { stack });
    }
}
