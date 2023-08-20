const { AppError, logger } = require('../../utils');

const errorHandler = (error, req, res, next) => {
    logger.error({ message: error.message, stack: error.stack });
    if (error instanceof AppError) {
        res.status(error.status).json({
            message: error.message,
            args: error.args,
            stack: error.stack,
        });
    } else {
        res.status(500).json({ message: error.message, stack: error.stack });
    }
    next();
};

module.exports = errorHandler;
