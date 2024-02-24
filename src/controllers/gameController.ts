import { Game } from '../database/models';

class GameController {
    async find(filter: { owner?: string, gameId?: string }) {
        return await Game.find(filter);
    }

    async createGame({ owner }: { owner: string }) {
        return await new Game({ owner }).create();
    }
}

export { GameController };
