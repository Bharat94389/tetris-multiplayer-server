import { IoSocket } from './socket';
import { jwt, logger, nextPiece, redisClient } from '../utils';
import { Game, PlayerStats } from '../database/models';
import { GameSchema } from '../database/schema';
import { GAME_EVENTS, GAME_STATUS } from '../constants';

interface UserData {
    email: string;
    username: string;
}

class SocketHelper {
    socket: IoSocket;
    userData: UserData;
    gameId: string;

    constructor({ socket, gameId }: { socket: IoSocket; gameId: string }) {
        this.socket = socket;
        this.gameId = gameId;
        this.userData = jwt.parse(socket.handshake.auth.token);
        logger.info(`User connected: ${this.userData.username}`);
    }

    async joinGame() {
        // Join game room
        this.socket.join(this.gameId);

        // Get data for the player
        const gameData = await this.getGameData();
        const playerStats = await this.getPlayerStats();
        const playersKey = redisClient.getPlayerCacheKey(this.gameId, '*');
        const currentPlayers = await redisClient.getMany(playersKey);

        // Send data to players
        this.socket.emit(GAME_EVENTS.GAME_DATA, { gameData, currentPlayers });
        this.socket.to(this.gameId).emit(GAME_EVENTS.PLAYER_JOINED, playerStats);
    }

    async startGame() {
        // Update Game Status
        const gameKey = redisClient.getGameCacheKey(this.gameId);
        let gameData = await redisClient.getOne(gameKey);
        if (!gameData) {
            return;
        }
        if (gameData.status !== GAME_STATUS.WAITING) {
            return;
        }
        gameData.status = GAME_STATUS.IN_PROGRESS;
        await redisClient.set(gameKey, gameData);

        // Notify players that game has started
        this.socket.in(this.gameId).emit(GAME_EVENTS.START_GAME);
        this.socket.emit(GAME_EVENTS.START_GAME);
    }

    async getGameData(): Promise<GameSchema | null> {
        // Check for game data in redis cache
        const gameKey = redisClient.getGameCacheKey(this.gameId);
        let gameData = await redisClient.getOne(gameKey);
        if (gameData) {
            return gameData;
        }

        // Fetch the game data from database if gamedata is not found
        gameData = await Game.find({ gameId: this.gameId });
        if (gameData.length === 0) {
            return null;
        }
        gameData = gameData[0];
        // Update redis cache
        redisClient.set(gameKey, gameData);
        return gameData;
    }

    async getPlayerStats() {
        const username = this.userData.username;
        // Check for player in the redis cache
        const playerKey = redisClient.getPlayerCacheKey(this.gameId, username);
        const playerStats = await redisClient.getOne(playerKey);
        if (playerStats) {
            // Check if player is not active update the data
            if (!playerStats.active) {
                playerStats.active = true;
                await redisClient.set(playerKey, playerStats);
            }
            return playerStats;
        }

        // Create new player stats since player is not present in the redis cache
        const newPlayerStats = new PlayerStats({ gameId: this.gameId, username, score: 0 }).data;
        await redisClient.set(playerKey, {
            ...newPlayerStats,
            active: true,
            gameOver: false,
        });
        return newPlayerStats;
    }

    async nextPiece({ pieceNumber }: { pieceNumber: number }) {
        // Check for game data in redis cache
        const gameKey = redisClient.getGameCacheKey(this.gameId);
        let gameData = await redisClient.getOne(gameKey);
        if (!gameData) {
            return;
        }
        // generate game piece if needed
        if (gameData.tSequence.length <= pieceNumber) {
            gameData.tSequence += nextPiece();
            await redisClient.set(gameKey, gameData);
        }
        this.socket.emit(GAME_EVENTS.NEXT_PIECE, gameData);
    }

    async scoreUpdate({ score, pieceNumber }: { score: number; pieceNumber: number }) {
        // Update player stats in redis cache
        const playerKey = redisClient.getPlayerCacheKey(this.gameId, this.userData.username);
        const playerStats = await redisClient.getOne(playerKey);
        if (!playerStats) {
            return;
        }
        playerStats.score = score;
        playerStats.numberOfPieces = pieceNumber;
        await redisClient.set(playerKey, playerStats);

        this.socket.to(this.gameId).emit(GAME_EVENTS.SCORE_UPDATE, playerStats);
    }

    async gameOver() {
        // Update player stats in redis cache
        const playerKey = redisClient.getPlayerCacheKey(this.gameId, this.userData.username);
        const playerStats = await redisClient.getOne(playerKey);
        playerStats.gameover = true;
        await redisClient.set(playerKey, playerStats);

        this.socket.to(this.gameId).emit(GAME_EVENTS.GAME_OVER, playerStats);
    }

    async disconnect() {
        // Update player stats in redis cache
        const playerKey = redisClient.getPlayerCacheKey(this.gameId, this.userData.username);
        const playerStats = await redisClient.getOne(playerKey);
        playerStats.active = false;
        await redisClient.set(playerKey, playerStats);

        // Notify others that this player has left the game
        this.socket.to(this.gameId).emit(GAME_EVENTS.PLAYER_LEFT, playerStats);

        // Remove the player from the room
        this.socket.leave(this.gameId);

        logger.info(`User disconnected: ${this.socket.id}`);
    }
}

export default SocketHelper;
