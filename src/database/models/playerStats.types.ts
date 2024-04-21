type TPlayerStatsParams = {
    username: string;
    gameId: string;
    gameOver?: boolean;
    score: number;
    numberOfPieces?: number;
    linesCleared?: number;
    createdAt?: Date;
};

interface IPlayerStats {
    username: string;
    gameId: string;
    gameOver: boolean;
    score: number;
    numberOfPieces: number;
    linesCleared: number;
    createdAt: Date;
}

export { IPlayerStats, TPlayerStatsParams };
