import { logger } from '../utils';
import { TNextFunction, TRequest, TResponse } from '../server.types';

const responseLogger = (req: TRequest, res: TResponse, next: TNextFunction): void => {
    req.on('finish', () => {
        logger.info('Request Completed', {
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            url: req.url,
            user: req.user?.username,
            method: req.method,
        });
    });
    next();
};

export default responseLogger;
