import { Router, Request, Response, NextFunction } from 'express';

class BaseRouter {
    router: Router;

    constructor() {
        this.router = Router();
    }

    tryCatch(callback: any): (req: Request, res: Response, next: NextFunction) => Promise<void> {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                await callback(req, res);
            } catch (error) {
                next(error);
            }
        };
    }

    setRoutes(): void {
        throw Error('To be implemented');
    }
}

export default BaseRouter;
