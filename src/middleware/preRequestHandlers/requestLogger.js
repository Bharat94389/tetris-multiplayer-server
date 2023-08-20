const { logger } = require('../../utils');

const requestLogger = (req, res, next) => {
    logger.info({
        args: {
            body: req.body,
            params: req.params,
            query: req.query,
            url: req.url,
            user: req.user,
            method: req.method,
        },
    });
    next();
};

module.exports = requestLogger;
