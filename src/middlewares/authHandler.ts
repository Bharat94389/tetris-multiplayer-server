import { JWT } from '../utils';
import { TNextFunction, TRequest, TResponse } from '../server.types';
import { UnauthorizedError } from '../errors';

const authHandler = (req: TRequest, res: TResponse, next: TNextFunction): void => {
    if (req.headers.authorization) {
        const [authType, token] = req.headers.authorization.split(' ');

        if (authType === 'Bearer' && token) {
            const userData = JWT.verify(token);
            if (userData) {
                req.user = userData;
                return next();
            }
            return next(new UnauthorizedError('Invalid authorization token provided'));
        }
    }

    next(new UnauthorizedError('No authorization token provided'));
};

export default authHandler;
