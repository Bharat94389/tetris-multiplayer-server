import { COLLECTIONS } from '../constants';
import database from '../database';
import { Game } from '../database/models';
import { IGame } from '../database/models/game.types';
import { AppError } from '../utils';
import { IGameController, TCreateGameParams } from './game.types';

class GameController implements IGameController {
    async find(query: Object): Promise<IGame[]> {
        try {
            const games = (await database.find<IGame>(COLLECTIONS.GAME, query)) as Game[];
            return games;
        } catch (err: any) {
            throw new AppError({
                message: err.message,
                args: {
                    stack: err.stack,
                    query,
                },
            });
        }
    }

    async createGame({ owner }: TCreateGameParams): Promise<IGame> {
        try {
            const game = new Game({ owner });
            await database.create(COLLECTIONS.GAME, game);
            return game;
        } catch (err: any) {
            throw new AppError({
                message: err.message,
                args: {
                    stack: err.stack,
                },
            });
        }
    }
}

export default GameController;
