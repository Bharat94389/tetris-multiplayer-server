import { FindOptions } from 'mongodb';
import BaseModel from './base.model';
import database from '../database';
import { GameData, GameSchema } from '../schema';
import { COLLECTIONS } from '../../constants';
import { AppError, logger } from '../../utils';

class Game extends BaseModel {
    data?: GameData;

    static async find(filter: any, options?: FindOptions<GameSchema>): Promise<GameSchema[]> {
        const gameCollection = database.getCollection<GameSchema>(COLLECTIONS.GAME);
        const gamesData = await gameCollection.find(filter, options).toArray();
        return gamesData.map((gameData) => new GameSchema(gameData));
    }

    async create(): Promise<GameSchema> {
        if (this.data) {
            const gameCollection = database.getCollection<GameSchema>(COLLECTIONS.GAME);
            const game = new GameSchema(this.data);
            await gameCollection.insertOne(game);
            logger.info(`Game with gameId ${game.gameId} created`);
            return game;
        } else {
            throw new AppError({
                message: 'Invalid Game Data',
                status: 400,
            });
        }
    }
}

export default Game;
