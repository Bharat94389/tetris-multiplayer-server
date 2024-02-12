import { Response, NextFunction } from '../server';
import { logger } from '../utils';

const responseLogger = (req: any, res: Response, next: NextFunction): void => {
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
