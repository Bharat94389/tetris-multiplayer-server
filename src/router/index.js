const AuthenticationRouter = require('./authenticationRouter');
const Controller = require('../controllers');
const BaseRouter = require('./baseRouter');

class AppRouter extends BaseRouter {
    constructor({ database, secretKey }) {
        super();

        this.controller = new Controller({ database, secretKey });

        this.getRoutes();
    }

    getRoutes() {
        this.openRouter.use(
            '/',
            new AuthenticationRouter({
                authenticationController: this.controller.authenticationController,
            }).openRouter
        );

        this.closedRouter.use(
            '/',
            new AuthenticationRouter({
                authenticationController: this.controller.authenticationController,
            }).closedRouter
        );
    }
}

module.exports = AppRouter;
