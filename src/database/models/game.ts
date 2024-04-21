import { uuid } from 'uuidv4';
import { nextNPieces } from '../../utils';
import { GAME_STATUS } from '../../constants';
import { IGame, TGameParams, TStatus } from './game.types';

class Game implements IGame {
    gameId: string;
    owner: string;
    tSequence: string;
    createdAt: Date;
    status: TStatus;

    constructor(gameData: TGameParams) {
        this.gameId = gameData.gameId || uuid();
        this.owner = gameData.owner;
        this.tSequence = gameData.tSequence || nextNPieces(5);
        this.createdAt = gameData.createdAt || new Date();
        this.status = gameData.status || GAME_STATUS.WAITING;
    }
}

export { Game };
