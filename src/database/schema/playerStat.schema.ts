export interface IPlayerStat {
    username: string;
    gameId: string;
    gameOver?: boolean;
    score?: number;
    state?: string[][];
    numberOfPieces?: number;
    linesCleared?: number;
    createdAt?: Date;
}

export class PlayerStat implements IPlayerStat {
    username: string;
    gameId: string;
    score: number;
    gameOver: boolean;
    state: string[][];
    numberOfPieces: number;
    linesCleared: number;
    createdAt: Date;

    constructor(gameStatsData: IPlayerStat) {
        this.username = gameStatsData.username;
        this.gameId = gameStatsData.gameId;
        this.gameOver = gameStatsData.gameOver || false;
        this.score = gameStatsData.score || 0;
        this.state = gameStatsData.state || new Array(20).map(() => new Array(10));
        this.linesCleared = gameStatsData.linesCleared || 0;
        this.numberOfPieces = gameStatsData.numberOfPieces || 0;
        this.createdAt = gameStatsData.createdAt || new Date();
    }
}
