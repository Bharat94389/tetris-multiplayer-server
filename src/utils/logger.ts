const { createLogger, format, transports } = require('winston');
const { combine, timestamp, json } = format;

class Logger {
    logger: any;

    constructor() {
        this.logger = createLogger({
            format: combine(timestamp(), json({ space: 0 })),
            transports: [new transports.Console()],
        });
    }

    info(message: string, args: Object | undefined = undefined) {
        if (args) {
            this.logger.info(message, args);
        } else {
            this.logger.info(message);
        }
    }

    error(message: string, stack: any) {
        this.logger.error(message, { stack });
    }
}

export default new Logger();
