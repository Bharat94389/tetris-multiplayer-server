import BaseRouter from './base';
import { AuthenticationController } from '../controllers';
import { TRequest, TResponse } from '../server.types';

class AuthenticationRouter extends BaseRouter {
    authenticationController: AuthenticationController;

    constructor() {
        super();

        this.authenticationController = new AuthenticationController();

        this.setRoutes();
    }

    setRoutes() {
        this.router.post('/login', this.tryCatch(this.login.bind(this)));
        this.router.post('/signup', this.tryCatch(this.signup.bind(this)));
    }

    async login(req: TRequest, res: TResponse) {
        const { email, password }: { email: string; password: string } = req.body;
        const result = await this.authenticationController.login({ email, password });

        if (result) {
            res.json(result);
        } else {
            res.sendStatus(401);
        }
    }

    async signup(req: TRequest, res: TResponse) {
        const { username, email, password }: { email: string; username: string; password: string } =
            req.body;
        const result = await this.authenticationController.signup({
            username,
            email,
            password,
        });
        res.json(result);
    }
}

export default AuthenticationRouter;
