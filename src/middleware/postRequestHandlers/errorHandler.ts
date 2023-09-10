import { Request, Response, NextFunction } from 'express';
import { AppError, logger } from '../../utils';

const errorHandler = (error: Error | AppError, req: Request, res: Response, next: NextFunction) => {
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
