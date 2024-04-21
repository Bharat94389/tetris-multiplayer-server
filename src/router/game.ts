import BaseRouter from './base';
import { GameController } from '../controllers';
import { TAuthenticatedRequest, TResponse } from '../server.types';

class GameRouter extends BaseRouter {
    gameController: GameController;

    constructor() {
        super();

        this.gameController = new GameController();

        this.setRoutes();
    }

    setRoutes() {
        this.router.get('/', this.tryCatch(this.find.bind(this)));
        this.router.post('/', this.tryCatch(this.createGame.bind(this)));
    }

    async find(req: TAuthenticatedRequest, res: TResponse) {
        const games = await this.gameController.find({ owner: req.user.username });
        res.send(games);
    }

    async createGame(req: TAuthenticatedRequest, res: TResponse) {
        const game = await this.gameController.createGame({ owner: req.user.username });
        res.send(game);
    }
}

export default GameRouter;
