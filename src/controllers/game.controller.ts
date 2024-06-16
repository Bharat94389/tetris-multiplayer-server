import { IGame } from '../database/schema';
import { GameModel } from '../database/models';
import { TRequestInfo } from 'server.types';

export interface IGameController {
    createGame(requestInfo: TRequestInfo): Promise<IGame>;
    find(requestInfo: TRequestInfo): Promise<IGame[]>;
}

export class GameController implements IGameController {
    constructor(private gameModel: GameModel) {}

    async find(requestInfo: TRequestInfo): Promise<IGame[]> {
        const { username } = requestInfo.user;

        // TODO: Update the logic to return all the games user has played
        // only return the games that the owner has created
        const query = { owner: username };

        const games = await this.gameModel.find(query);
        return games;
    }

    async createGame(requestInfo: TRequestInfo): Promise<IGame> {
        const { username } = requestInfo.user;

        return await this.gameModel.create({ owner: username });
    }
}
