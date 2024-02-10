import { uuid } from 'uuidv4';
import { GAME_STATUS } from '../../constants';

type TStatus =
    | typeof GAME_STATUS.IN_PROGRESS
    | typeof GAME_STATUS.COMPLETED
    | typeof GAME_STATUS.WAITING;

interface GameData {
    gameId?: string;
    tSequence: string;
    status: TStatus;
    createdAt?: Date;
}

class GameSchema implements GameData {
    gameId: string;
    tSequence: string;
    createdAt: Date;
    status: TStatus;

    constructor(gameData: GameData) {
        this.gameId = gameData.gameId || uuid();
        this.tSequence = gameData.tSequence;
        this.createdAt = gameData.createdAt || new Date();
        this.status = gameData.status;
    }
}

export { GameData, GameSchema };
