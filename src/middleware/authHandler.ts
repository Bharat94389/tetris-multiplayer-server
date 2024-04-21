import { AppError, jwt } from '../utils';
import { TNextFunction, TRequest, TResponse } from '../server.types';

const authHandler = (req: TRequest, res: TResponse, next: TNextFunction): void => {
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
