const { createLogger, format, transports } = require('winston');
const { combine, timestamp, json } = format;

class Logger {
    constructor() {
        this.logger = createLogger({
            format: combine(timestamp(), json({ space: 0 })),
            transports: [new transports.Console()],
        });
    }

    info({ message, args }) {
        this.logger.info(message, args);
    }

    error({ message, stack }) {
        this.logger.error(message, { stack });
    }
}

module.exports = { Logger };
