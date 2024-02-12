interface PlayerStatsData {
    username: string;
    gameId: string;
    score: number;
    createdAt?: Date;
}

class PlayerStatsSchema {
    username: string;
    gameId: string;
    score: number;
    createdAt: Date;

    constructor(gameStatsData: PlayerStatsData) {
        this.username = gameStatsData.username;
        this.gameId = gameStatsData.gameId;
        this.score = gameStatsData.score;
        this.createdAt = gameStatsData.createdAt || new Date();
    }
}

export { PlayerStatsData, PlayerStatsSchema };
