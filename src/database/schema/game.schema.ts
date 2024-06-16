import { uuid } from 'uuidv4';
import { nextNPieces } from '../../utils';
import { GAME_STATUS } from '../../constants';

export type TStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS];

export interface IGame {
    gameId?: string;
    owner: string;
    tSequence?: string;
    status?: TStatus;
    createdAt?: Date;
}

export class Game implements IGame {
    gameId: string;
    owner: string;
    tSequence: string;
    createdAt: Date;
    status: TStatus;

    constructor(gameData: IGame) {
        this.gameId = gameData.gameId || uuid();
        this.owner = gameData.owner;
        this.tSequence = gameData.tSequence || nextNPieces(5);
        this.createdAt = gameData.createdAt || new Date();
        this.status = gameData.status || GAME_STATUS.WAITING;
    }
}
