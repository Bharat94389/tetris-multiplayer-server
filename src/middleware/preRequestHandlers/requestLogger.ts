import { logger } from '../../utils';
import { Request, Response, NextFunction } from '../../types';

const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
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
