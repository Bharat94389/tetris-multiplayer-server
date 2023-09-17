import { Request, Response, NextFunction } from '../../types';
import { logger } from '../../utils';

const responseLogger = (req: Request, res: Response, next: NextFunction) => {
    logger.info('Request Completed', {
        statusCode: res.statusCode,
        statusMessage: res.statusMessage,
        url: req.url,
        method: req.method,
    });
    next();
};

export default responseLogger;
