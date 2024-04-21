import { logger } from '../utils';
import { TNextFunction, TRequest, TResponse } from '../server.types';

const requestLogger = (req: TRequest, res: TResponse, next: TNextFunction): void => {
    logger.info('Incoming Request', {
        body: req.body,
        url: req.url,
        method: req.method,
        'user-agent': req.headers['user-agent'],
    });
    next();
};

export default requestLogger;
