const { logger } = require('../../utils');

const responseLogger = (req, res, next) => {
    logger.info({
        args: {
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            url: res.url,
            method: res.method,
        },
    });
    next();
};

module.exports = responseLogger;
