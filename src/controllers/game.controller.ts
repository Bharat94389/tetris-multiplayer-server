import { IDatabase } from 'database';
import { COLLECTIONS } from '../constants';
import { Game } from '../database/models';
import { IGame } from '../database/models/game.types';
import { TRequestInfo } from 'server.types';

export interface IGameController {
    createGame(requestInfo: TRequestInfo): Promise<IGame>;
    find(requestInfo: TRequestInfo): Promise<IGame[]>;
}

export class GameController implements IGameController {
    constructor(private database: IDatabase) {}

    async find(requestInfo: TRequestInfo): Promise<IGame[]> {
        const { username } = requestInfo.user;

        // TODO: Update the logic to return all the games user has played
        // only return the games that the owner has created
        const query = { owner: username };

        const games = (await this.database.find<IGame>(COLLECTIONS.GAME, query)) as Game[];
        return games;
    }

    async createGame(requestInfo: TRequestInfo): Promise<IGame> {
        const { username } = requestInfo.user;

        const game = new Game({ owner: username });
        await this.database.create(COLLECTIONS.GAME, game);
        return game;
    }
}
