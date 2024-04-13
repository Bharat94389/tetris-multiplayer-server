import { Request, Response } from 'express';

import BaseRouter from './baseRouter';
import { AuthenticationController } from '../controllers';

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

    async login(req: Request, res: Response) {
        const { email, password }: { email: string; password: string } = req.body;
        const result = await this.authenticationController.login({ email, password });
        
        if (result) {
            res.json(result);
        } else {
            res.sendStatus(401);
        }
    }

    async signup(req: Request, res: Response) {
        const { username, email, password }: { email: string; username: string; password: string } = req.body;
        const result = await this.authenticationController.signup({
            username,
            email,
            password,
        });
        res.json(result);
    }
}

export { AuthenticationRouter };
