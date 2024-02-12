import { GameController } from '../controllers';
import { AuthenticatedRequest, Response } from '../server';
import BaseRouter from './baseRouter';

class GameRouter extends BaseRouter {
    gameController: GameController;

    constructor() {
        super();

        this.gameController = new GameController();

        this.setRoutes();
    }

    setRoutes() {
        this.router.get('/', this.tryCatch(this.find.bind(this)));
    }

    async find(req: AuthenticatedRequest, res: Response) {
        const games = await this.gameController.find({ owner: req.user.username });
        res.send(games);
    }
}

export { GameRouter };
