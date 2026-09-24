import { IGame } from '../database/schema';
import { GameModel, PlayerStatModel } from '../database/models';
import { TRequestInfo } from 'server.types';

export interface IGameController {
    createGame(requestInfo: TRequestInfo): Promise<IGame>;
    find(requestInfo: TRequestInfo): Promise<IGame[]>;
}

export class GameController implements IGameController {
    constructor(
        private gameModel: GameModel,
        private playerStatModel: PlayerStatModel
    ) {}

    async find(requestInfo: TRequestInfo): Promise<IGame[]> {
        const { username } = requestInfo.user;

        // return the games the user has created or joined
        const playerStats = await this.playerStatModel.find(
            { username },
            { projection: { gameId: 1 } }
        );
        const gameIds = playerStats.map((stat) => stat.gameId);
        const query = { $or: [{ owner: username }, { gameId: { $in: gameIds } }] };

        const games = await this.gameModel.find(query);
        return games;
    }

    async createGame(requestInfo: TRequestInfo): Promise<IGame> {
        const { username } = requestInfo.user;

        return await this.gameModel.create({ owner: username });
    }
}
