import { Response, NextFunction } from 'express';
import { logger } from '../../utils';

const requestLogger = (req: any, res: Response, next: NextFunction) => {
    logger.info('Incoming Request', {
        body: req.body,
        params: req.params,
        query: req.query,
        url: req.url,
        user: req.user,
        method: req.method,
    });
    next();
};

export default requestLogger;
