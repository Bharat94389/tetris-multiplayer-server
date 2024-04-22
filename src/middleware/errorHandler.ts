import { AppError, logger } from '../utils';
import { TNextFunction, TRequest, TResponse } from '../server.types';

const errorHandler = (
    error: Error | AppError,
    req: TRequest,
    res: TResponse,
    next: TNextFunction
): void => {
    logger.error(error.message, error.stack);
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

export default errorHandler;
