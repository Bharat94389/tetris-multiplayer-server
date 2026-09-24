import { GAME_CONSTANTS } from '../../constants';

// 0 for an empty cell, otherwise the letter of the piece that filled it
export type TBoardCell = 0 | string;
export type TBoard = TBoardCell[][];

export interface IPlayerStat {
    username: string;
    gameId: string;
    gameOver?: boolean;
    score?: number;
    state?: TBoard;
    numberOfPieces?: number;
    linesCleared?: number;
    createdAt?: Date;
}

const createEmptyBoard = (): TBoard =>
    Array.from({ length: GAME_CONSTANTS.ROWS }, () => new Array(GAME_CONSTANTS.COLS).fill(0));

export class PlayerStat implements IPlayerStat {
    username: string;
    gameId: string;
    score: number;
    gameOver: boolean;
    state: TBoard;
    numberOfPieces: number;
    linesCleared: number;
    createdAt: Date;

    constructor(gameStatsData: IPlayerStat) {
        this.username = gameStatsData.username;
        this.gameId = gameStatsData.gameId;
        this.gameOver = gameStatsData.gameOver || false;
        this.score = gameStatsData.score || 0;
        this.state = gameStatsData.state || createEmptyBoard();
        this.linesCleared = gameStatsData.linesCleared || 0;
        this.numberOfPieces = gameStatsData.numberOfPieces || 0;
        this.createdAt = gameStatsData.createdAt || new Date();
    }
}
