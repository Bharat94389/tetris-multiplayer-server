import { Request as ExpressRequest, Response, NextFunction, Express } from 'express';

interface Request extends ExpressRequest {
    user?: any;
}

export { Request, Response, NextFunction, Express };
