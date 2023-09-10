import { Router, Request, Response, NextFunction } from 'express';

class BaseRouter {
    router: Router;

    constructor() {
        this.router = Router();
    }

    tryCatch(callback: any) {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                await callback(req, res);
                next();
            } catch (error) {
                next(error);
            }
        };
    }

    setRoutes() {
        throw Error('To be implemented');
    }
}

export default BaseRouter;
