import { Router } from 'express';
import { TNextFunction, TRequest, TResponse, TRouter } from '../server.types';

abstract class BaseRouter {
    router: TRouter;

    constructor() {
        this.router = Router();
    }

    tryCatch(callback: any): (req: TRequest, res: TResponse, next: TNextFunction) => Promise<void> {
        return async (req: TRequest, res: TResponse, next: TNextFunction) => {
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
