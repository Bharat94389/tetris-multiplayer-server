import { BaseRouter } from './base.router';
import { IGameController } from '../controllers';
import { TNextFunction, TRequest, TResponse } from '../server.types';
import { HTTP_STATUS_CODES } from '../constants';

export class GameRouter extends BaseRouter {
    constructor(private gameController: IGameController) {
        super();

        this.setRoutes();
    }

    setRoutes() {
        this.router.get('/', this.find.bind(this));
        this.router.post('/', this.createGame.bind(this));
    }

    async find(req: TRequest, res: TResponse, next: TNextFunction) {
        try {
            const requestInfo = this.getRequestInfo(req);
            const results = await this.gameController.find(requestInfo);

            res.json(results);
        } catch (err) {
            next(err);
        }
    }

    async createGame(req: TRequest, res: TResponse, next: TNextFunction) {
        try {
            const requestInfo = this.getRequestInfo(req);
            const results = await this.gameController.createGame(requestInfo);

            res.status(HTTP_STATUS_CODES.CREATED).json(results);
        } catch (err) {
            next(err);
        }
    }
}
