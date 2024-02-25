interface PlayerStatsData {
    username: string;
    gameId: string;
    score: number;
    numberOfPieces: number;
    createdAt?: Date;
}

class PlayerStatsSchema {
    username: string;
    gameId: string;
    score: number;
    numberOfPieces: number;
    createdAt: Date;

    constructor(gameStatsData: PlayerStatsData) {
        this.username = gameStatsData.username;
        this.gameId = gameStatsData.gameId;
        this.score = gameStatsData.score;
        this.numberOfPieces = gameStatsData.numberOfPieces || 0;
        this.createdAt = gameStatsData.createdAt || new Date();
    }
}

export { PlayerStatsData, PlayerStatsSchema };
