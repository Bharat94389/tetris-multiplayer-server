import { logger } from '../utils';
import { Request, Response, NextFunction } from '../server';

const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
    logger.info('Incoming Request', {
        body: req.body,
        url: req.url,
        method: req.method,
        'user-agent': req.headers['user-agent'],
    });
    next();
};

export default requestLogger;
