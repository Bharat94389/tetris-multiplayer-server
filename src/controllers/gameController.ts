import { COLLECTIONS } from '../constants';
import database from '../database';
import { Game, TGame } from '../database/models';
import { AppError } from '../utils';

class GameController {
    async find(query: Object): Promise<TGame[]> {
        try {
            const games = (await database.find<TGame>(COLLECTIONS.GAME, query)) as Game[];
            return games;
        } catch (err: any) {
            throw new AppError({
                message: err.message,
                args: {
                    stack: err.stack,
                    query
                },
            });
        } 
    }

    async createGame({ owner }: { owner: string }): Promise<TGame> {
        try {
            const game = new Game({ owner });
            await database.create(COLLECTIONS.GAME, game);
            return game;
        } catch (err: any) {
            throw new AppError({
                message: err.message,
                args: {
                    stack: err.stack
                },
            });
        }
    }
}

export { GameController };
