import { Logger } from '../utils';
import { TNextFunction, TRequest, TResponse } from '../server.types';
import { BaseError } from '../errors';

const errorHandler = (
    error: Error,
    req: TRequest,
    res: TResponse,
    next: TNextFunction
): void => {
    Logger.error(error.message, error.stack);
    if (error instanceof BaseError) {
        res.status(error.statusCode).json({
            name: error.name,
            message: error.message,
            args: error.args,
        });
    } else {
        res.status(500).json({ message: error.message, stack: error.stack });
    }
    next();
};

export default errorHandler;
