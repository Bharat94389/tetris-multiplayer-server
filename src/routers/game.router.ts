import { BaseRouter } from './base.router';
import { IGameController } from '../controllers';
import { TNextFunction, TRequest, TResponse } from '../server.types';

export class GameRouter extends BaseRouter {
    constructor(private gameController: IGameController) {
        super();

        this.setRoutes();
    }

    setRoutes() {
        this.router.get('/', this.find.bind(this));
        this.router.post('/', this.createGame.bind(this));
    }

    find(req: TRequest, res: TResponse, next: TNextFunction) {
        try {
            const requestInfo = this.getRequestInfo(req);
            const results = this.gameController.find(requestInfo);

            res.json(results);
        } catch (err) {
            next(err);
        }
    }

    createGame(req: TRequest, res: TResponse, next: TNextFunction) {
        try {
            const requestInfo = this.getRequestInfo(req);
            const results = this.gameController.createGame(requestInfo);

            res.status(201).json(results);
        } catch (err) {
            next(err);
        }
    }
}
