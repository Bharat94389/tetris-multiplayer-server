import { AppError, jwt } from '../utils';
import { Response, NextFunction } from '../server';

const authHandler = (req: any, res: Response, next: NextFunction): void => {
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

    next(new AppError({ message: 'Unauthorized', status: 401 }));
};

export default authHandler;
