import { BaseRouter } from './base.router';
import { IAuthenticationController } from '../controllers';
import { TNextFunction, TRequest, TResponse } from 'server.types';
import { HTTP_STATUS_CODES } from '../constants';

export class AuthenticationRouter extends BaseRouter {
    constructor(private authenticationController: IAuthenticationController) {
        super();

        this.setRoutes();
    }

    setRoutes() {
        this.router.post('/login', this.login.bind(this));
        this.router.post('/signup', this.signup.bind(this));
    }

    async login(req: TRequest, res: TResponse, next: TNextFunction) {
        try {
            const requestInfo = this.getRequestInfo(req);
            const results = await this.authenticationController.login(requestInfo);

            res.json(results);
        } catch (err) {
            next(err);
        }
    }

    async signup(req: TRequest, res: TResponse, next: TNextFunction) {
        try {
            const requestInfo = this.getRequestInfo(req);
            await this.authenticationController.signup(requestInfo);

            res.status(HTTP_STATUS_CODES.CREATED).json();
        } catch (err) {
            next(err);
        }
    }
}
