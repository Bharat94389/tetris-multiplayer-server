import { Request, Response } from 'express';
import BaseRouter from './baseRouter';
import { AuthenticationController } from '../controllers';
import { Database } from '../types';

class AuthenticationRouter extends BaseRouter {
    authenticationController: AuthenticationController;

    constructor({ database }: { database: Database }) {
        super();

        this.authenticationController = new AuthenticationController({ database });

        this.setRoutes();
    }

    setRoutes() {
        this.router.post('/login', this.tryCatch(this.login.bind(this)));
        this.router.post('/signup', this.tryCatch(this.signup.bind(this)));
        this.router.get('/verify/:token', this.tryCatch(this.verify.bind(this)));
    }

    async login(req: Request, res: Response) {
        const { username, password }: { username: string; password: string } = req.body;
        const result = await this.authenticationController.login({ username, password });
        res.json(result);
    }

    async signup(req: Request, res: Response) {
        const { email, username, password }: { email: string; username: string; password: string } =
            req.body;
        const result = await this.authenticationController.signup({
            email,
            username,
            password,
        });
        res.json(result);
    }

    async verify(req: Request, res: Response) {
        const { token }: { token?: string } = req.params;
        const result = await this.authenticationController.verify({ token });
        res.json(result);
    }
}

export default AuthenticationRouter;
