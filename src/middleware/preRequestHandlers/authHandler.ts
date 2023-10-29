import { jwt, logger } from '../../utils';
import { Request, Response, NextFunction } from '../../types';

const authHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.headers.authorization) {
        const [authType, token] = req.headers.authorization.split(' ');

        if (authType === 'Bearer' && token) {
            const userData = jwt.verify(token);
            if (userData) {
                req.user = userData;
                return next();
            }
        }
    }

    res.sendStatus(401).end();
    logger.info(res.statusMessage, {
        statusCode: res.statusCode,
        url: req.url,
        method: req.method,
    });
};

export default authHandler;
