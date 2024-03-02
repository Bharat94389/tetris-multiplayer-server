interface PlayerStatsData {
    username: string;
    gameId: string;
    gameOver: boolean;
    score: number;
    numberOfPieces: number;
    linesCleared: number;
    createdAt?: Date;
}

class PlayerStatsSchema {
    username: string;
    gameId: string;
    score: number;
    gameOver: boolean;
    numberOfPieces: number;
    linesCleared: number;
    createdAt: Date;

    constructor(gameStatsData: PlayerStatsData) {
        this.username = gameStatsData.username;
        this.gameId = gameStatsData.gameId;
        this.gameOver = gameStatsData.gameOver || false;
        this.score = gameStatsData.score || 0;
        this.linesCleared = gameStatsData.linesCleared || 0;
        this.numberOfPieces = gameStatsData.numberOfPieces || 0;
        this.createdAt = gameStatsData.createdAt || new Date();
    }
}

export { PlayerStatsData, PlayerStatsSchema };
