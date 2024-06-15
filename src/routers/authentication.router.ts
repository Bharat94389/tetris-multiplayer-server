import { BaseRouter } from './base.router';
import { IAuthenticationController } from '../controllers';
import { TNextFunction, TRequest, TResponse } from 'server.types';

export class AuthenticationRouter extends BaseRouter {
    constructor(private authenticationController: IAuthenticationController) {
        super();

        this.setRoutes();
    }

    setRoutes() {
        this.router.post('/login', this.login.bind(this));
        this.router.post('/signup', this.signup.bind(this));
    }

    login(req: TRequest, res: TResponse, next: TNextFunction) {
        try {
            const requestInfo = this.getRequestInfo(req);
            const results = this.authenticationController.login(requestInfo);

            res.status(200).json(results);
        } catch (err) {
            next(err);
        }
    }

    signup(req: TRequest, res: TResponse, next: TNextFunction) {
        try {
            const requestInfo = this.getRequestInfo(req);
            const results = this.authenticationController.signup(requestInfo);

            res.status(201).json(results);
        } catch (err) {
            next(err);
        }
    }
}
