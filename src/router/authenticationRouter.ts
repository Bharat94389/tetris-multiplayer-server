import { Request, Response } from 'express';
import BaseRouter from './baseRouter';
import { AuthenticationController } from '../controllers';
import { UserSchema } from '../database/schema';

class AuthenticationRouter extends BaseRouter {
    authenticationController: AuthenticationController;

    constructor() {
        super();

        this.authenticationController = new AuthenticationController();

        this.setRoutes();
    }

    setRoutes(): void {
        this.router.post('/login', this.tryCatch(this.login.bind(this)));
        this.router.post('/signup', this.tryCatch(this.signup.bind(this)));
        this.router.get('/verify/:token', this.tryCatch(this.verify.bind(this)));
    }

    async login(req: Request, res: Response): Promise<void> {
        const { email, password }: { email: string; password: string } = req.body;
        const result = await this.authenticationController.login({ email, password });
        res.json(result);
    }

    async signup(req: Request, res: Response): Promise<void> {
        const { email, password }: UserSchema = req.body;
        const result = await this.authenticationController.signup({
            email,
            password,
        });
        res.json(result);
    }

    async verify(req: Request, res: Response): Promise<void> {
        const { token }: { token?: string } = req.params;
        const result = await this.authenticationController.verify({ token });
        res.json(result);
    }
}

export default AuthenticationRouter;
