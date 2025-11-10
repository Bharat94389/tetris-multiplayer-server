import { Socket as IoSocket } from 'socket.io';
import { IRedisClient, Logger, nextNPieces } from '../utils';
import { GAME_EVENTS, GAME_STATUS } from '../constants';
import { IPlayerStat, IGame } from '../database/schema';
import { GameModel, PlayerStatModel } from '../database/models';

interface IPlayerStat1 extends IPlayerStat {
    active?: boolean;
}

class SocketHelper {
    username: string;
    gameId: string;

    constructor(
        private socket: IoSocket,
        private redisClient: IRedisClient,
        private gameModel: GameModel,
        private playerStatModel: PlayerStatModel,
    ) {
        this.username = socket.data.username;
        this.gameId = socket.data.gameId;

        Logger.info(`User connected: ${this.username}`);
    }

    async joinGame() {
        // Join game room
        this.socket.join(this.gameId);

        // Get data for the player
        const gameData = await this.getGameData();
        if (!gameData) {
            // handle no game with id exists error
            return;
        }
        const playerStats = await this.getPlayerStats();
        const playersKey = this.redisClient.getPlayerCacheKey(this.gameId, '*');
        const currentPlayers: IPlayerStat1[] = await this.redisClient.getMany(playersKey);

        // Send data to players
        this.socket.emit(GAME_EVENTS.GAME_DATA, { gameData, currentPlayers });
        this.socket.to(this.gameId).emit(GAME_EVENTS.PLAYER_JOINED, playerStats);
    }

    async startGame() {
        // Update Game Status
        const gameKey = this.redisClient.getGameCacheKey(this.gameId);
        const gameData: IGame | null = await this.redisClient.getOne(gameKey);
        if (!gameData) {
            return;
        }
        if (gameData.status !== GAME_STATUS.WAITING) {
            return;
        }
        gameData.status = GAME_STATUS.IN_PROGRESS;
        await this.redisClient.set(gameKey, gameData);

        // Notify players that game has started
        this.socket.in(this.gameId).emit(GAME_EVENTS.START_GAME);
        this.socket.emit(GAME_EVENTS.START_GAME);
    }

    async getGameData(): Promise<IGame | null> {
        // Check for game data in redis cache
        const gameKey = this.redisClient.getGameCacheKey(this.gameId);
        let gameData: IGame | null = await this.redisClient.getOne(gameKey);
        if (gameData && !Array.isArray(gameData)) {
            return gameData;
        }

        // Fetch the game data from database if gamedata is not found
        gameData = await this.gameModel.findOne({ gameId: this.gameId });
        if (!gameData) {
            return null;
        }
        // Update redis cache
        this.redisClient.set(gameKey, gameData);
        return gameData;
    }

    async getPlayerStats() {
        const username = this.username;
        // Check for player in the redis cache
        const playerKey = this.redisClient.getPlayerCacheKey(this.gameId, username);
        const playerStats: IPlayerStat1 | null = await this.redisClient.getOne(playerKey);
        if (playerStats) {
            // Check if player is not active update the data
            if (!playerStats.active) {
                playerStats.active = true;
                await this.redisClient.set(playerKey, playerStats);
            }
            return playerStats;
        }

        // Create new player stats since player is not present in the redis cache\
        const newPlayerStat: IPlayerStat1 = await this.playerStatModel.create({
            gameId: this.gameId,
            username,
        });
        newPlayerStat.active = true;
        await this.redisClient.set(playerKey, newPlayerStat);

        return newPlayerStat;
    }

    async nextPiece({ pieceNumber }: { pieceNumber: number }) {
        // Check for game data in redis cache
        const gameKey = this.redisClient.getGameCacheKey(this.gameId);
        const gameData: IGame | null = await this.redisClient.getOne(gameKey);
        if (!gameData) {
            return;
        }
        // generate game piece if needed
        if (gameData.tSequence.length <= pieceNumber) {
            gameData.tSequence += nextNPieces(5);
            await this.redisClient.set(gameKey, gameData);
        }
        this.socket.emit(GAME_EVENTS.NEXT_PIECE, gameData);
    }

    async scoreUpdate({
        score,
        pieceNumber,
        linesCleared,
    }: {
        score: number;
        pieceNumber: number;
        linesCleared: number;
    }) {
        // Update player stats in redis cache
        const playerKey = this.redisClient.getPlayerCacheKey(this.gameId, this.username);
        const playerStats: IPlayerStat | null = await this.redisClient.getOne(playerKey);
        if (!playerStats) {
            return;
        }
        playerStats.score = score;
        playerStats.numberOfPieces = pieceNumber;
        playerStats.linesCleared = linesCleared;
        await this.redisClient.set(playerKey, playerStats);

        this.socket.to(this.gameId).emit(GAME_EVENTS.SCORE_UPDATE, playerStats);
    }

    async gameOver() {
        // Update player stats in redis cache
        const playerKey = this.redisClient.getPlayerCacheKey(this.gameId, this.username);
        const playerStats: IPlayerStat1 | null = await this.redisClient.getOne(playerKey);
        if (!playerStats) {
            return;
        }
        playerStats.gameOver = true;
        await this.redisClient.set(playerKey, playerStats);

        // notify other players
        this.socket.to(this.gameId).emit(GAME_EVENTS.GAME_OVER, playerStats);

        // Update player stats in db
        await this.playerStatModel.update(
            {
                gameId: this.gameId,
                username: this.username,
            },
            playerStats
        );
    }

    async disconnect() {
        // Update player stats in redis cache
        const playerKey = this.redisClient.getPlayerCacheKey(this.gameId, this.username);
        const playerStats: IPlayerStat1 | null = await this.redisClient.getOne(playerKey);
        if (playerStats) {
            playerStats.active = false;
            await this.redisClient.set(playerKey, playerStats);
        }

        // Notify others that this player has left the game
        this.socket.to(this.gameId).emit(GAME_EVENTS.PLAYER_LEFT, playerStats);

        // Remove the player from the room
        this.socket.leave(this.gameId);

        Logger.info(`User disconnected: ${this.username}`);
    }
}

export default SocketHelper;
