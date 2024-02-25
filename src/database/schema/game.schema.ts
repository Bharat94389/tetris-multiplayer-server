import { uuid } from 'uuidv4';
import { GAME_STATUS } from '../../constants';
import { nextPiece } from '../../utils';

type TStatus =
    | typeof GAME_STATUS.IN_PROGRESS
    | typeof GAME_STATUS.COMPLETED
    | typeof GAME_STATUS.WAITING;

interface GameData {
    gameId?: string;
    owner: string;
    tSequence?: string;
    status?: TStatus;
    createdAt?: Date;
}

class GameSchema implements GameData {
    gameId: string;
    owner: string;
    tSequence: string;
    createdAt: Date;
    status: TStatus;

    constructor(gameData: GameData) {
        this.gameId = gameData.gameId || uuid();
        this.owner = gameData.owner;
        this.tSequence = gameData.tSequence || (nextPiece() + nextPiece());
        this.createdAt = gameData.createdAt || new Date();
        this.status = gameData.status || GAME_STATUS.WAITING;
    }
}

export { GameData, GameSchema };
