const { Router } = require('express');

class BaseRouter {
    constructor() {
        this.openRouter = new Router();
        this.closedRouter = new Router();
    }

    tryCatch(callback) {
        return async (req, res, next) => {
            try {
                await callback(req, res);
                next();
            } catch (error) {
                next(error);
            }
        };
    }

    getRoutes() {
        throw Error('To be implemented');
    }
}

module.exports = BaseRouter;
