import { Router } from 'express';
import { TRequest, TRequestInfo } from '../server.types';

export abstract class BaseRouter {
    protected router: Router;

    constructor() {
        this.router = Router();
    }

    protected getRequestInfo(req: TRequest): TRequestInfo {
        return {
            params: req.params,
            body: req.body,
            url: req.originalUrl,
            user: req.user,
        };
    }

    setRoutes(): void {
        throw Error('To be implemented');
    }

    getRouter(): Router {
        return this.router;
    }
}
