const AuthenticationRouter = require('./authenticationRouter');
const Controller = require('../controllers');

class Router {
    constructor({ Router, database, ...args }) {
        this.Router = Router;
        this.args = args;

        this.controller = new Controller({ database });
    }

    getRoutes() {
        const router = this.Router();
        router.use(
            '/',
            new AuthenticationRouter({
                Router: this.Router,
                tryCatch: this.tryCatch,
                authenticationController: this.controller.authenticationController,
                ...this.args,
            }).getRoutes()
        );

        return router;
    }

    tryCatch(callback) {
        return async (req, res, next) => {
            try {
                await callback(req, res);
            } catch (error) {
                next(error);
            }
        };
    }
}

module.exports = Router;
