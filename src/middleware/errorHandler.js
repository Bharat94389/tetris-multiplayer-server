const { AppError } = require('../utils/appError');

const errorHandler = (error, req, res, next) => {
    console.log(error);
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
