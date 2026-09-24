import { Socket as IoSocket } from 'socket.io';
import { IRedisClient, Logger, isValidBoard, nextNPieces } from '../utils';
import { GAME_CONSTANTS, GAME_EVENTS, GAME_STATUS } from '../constants';
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
        // Get data for the player
        const gameData = await this.getGameData();
        if (!gameData) {
            // Let the player know the game does not exist and close the connection
            this.socket.emit(GAME_EVENTS.GAME_NOT_FOUND);
            this.socket.disconnect(true);
            return;
        }

        // Join game room
        this.socket.join(this.gameId);

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
        if (gameData.owner !== this.username || gameData.status !== GAME_STATUS.WAITING) {
            return;
        }
        gameData.status = GAME_STATUS.IN_PROGRESS;
        await this.redisClient.set(gameKey, gameData);
        await this.gameModel.update({ gameId: this.gameId }, { status: gameData.status });

        // Notify players that game has started
        this.socket.in(this.gameId).emit(GAME_EVENTS.START_GAME);
        this.socket.emit(GAME_EVENTS.START_GAME);
    }

    async getGameData(): Promise<IGame | null> {
        // Check for game data in redis cache
        const gameKey = this.redisClient.getGameCacheKey(this.gameId);
        let gameData: IGame | null = await this.redisClient.getOne(gameKey);
        if (!gameData || Array.isArray(gameData)) {
            // Fetch the game data from database if gamedata is not found
            gameData = await this.gameModel.findOne({ gameId: this.gameId });
            if (!gameData) {
                return null;
            }
            // Update redis cache
            await this.redisClient.set(gameKey, gameData);
        }

        // The piece sequence is kept in its own key so it can be appended to atomically
        gameData.tSequence = await this.getSequence(gameData.tSequence || '');
        return gameData;
    }

    async getSequence(initialSequence: string): Promise<string> {
        const sequenceKey = this.redisClient.getSequenceCacheKey(this.gameId);
        await this.redisClient.setStringIfNotExists(sequenceKey, initialSequence);
        return (await this.redisClient.getString(sequenceKey)) || initialSequence;
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
        const gameData = await this.getGameData();
        if (!gameData || !gameData.tSequence) {
            return;
        }
        // generate game pieces if needed, APPEND is atomic so players asking for pieces at the
        // same time still share one sequence (at worst an extra batch is added)
        if (Number.isInteger(pieceNumber) && gameData.tSequence.length <= pieceNumber) {
            const sequenceKey = this.redisClient.getSequenceCacheKey(this.gameId);
            await this.redisClient.appendString(
                sequenceKey,
                nextNPieces(GAME_CONSTANTS.PIECES_BATCH_SIZE)
            );
            gameData.tSequence = await this.getSequence(gameData.tSequence);
        }
        this.socket.emit(GAME_EVENTS.NEXT_PIECE, gameData);
    }

    async scoreUpdate({
        score,
        pieceNumber,
        linesCleared,
        state,
    }: {
        score: number;
        pieceNumber: number;
        linesCleared: number;
        state?: unknown;
    }) {
        // Update player stats in redis cache
        const playerKey = this.redisClient.getPlayerCacheKey(this.gameId, this.username);
        const playerStats: IPlayerStat1 | null = await this.redisClient.getOne(playerKey);
        if (!playerStats || playerStats.gameOver) {
            return;
        }
        if (![score, pieceNumber, linesCleared].every((n) => Number.isInteger(n) && n >= 0)) {
            return;
        }
        playerStats.score = score;
        playerStats.numberOfPieces = pieceNumber;
        playerStats.linesCleared = linesCleared;
        // the board is stored so the player can continue after a refresh or on another device
        if (isValidBoard(state)) {
            playerStats.state = state;
        }
        await this.redisClient.set(playerKey, playerStats);

        this.socket.to(this.gameId).emit(GAME_EVENTS.SCORE_UPDATE, playerStats);
    }

    async gameOver() {
        // Update player stats in redis cache
        const playerKey = this.redisClient.getPlayerCacheKey(this.gameId, this.username);
        const playerStats: IPlayerStat1 | null = await this.redisClient.getOne(playerKey);
        if (!playerStats || playerStats.gameOver) {
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

        await this.completeGameIfFinished();
    }

    async completeGameIfFinished() {
        const playersKey = this.redisClient.getPlayerCacheKey(this.gameId, '*');
        const players: IPlayerStat1[] = await this.redisClient.getMany(playersKey);
        if (!players.every((player) => player.gameOver)) {
            return;
        }

        const gameKey = this.redisClient.getGameCacheKey(this.gameId);
        const gameData = await this.getGameData();
        if (!gameData || gameData.status === GAME_STATUS.COMPLETED) {
            return;
        }
        gameData.status = GAME_STATUS.COMPLETED;
        await this.redisClient.set(gameKey, gameData);
        await this.gameModel.update(
            { gameId: this.gameId },
            { status: gameData.status, tSequence: gameData.tSequence }
        );
    }

    async disconnect() {
        // Update player stats in redis cache
        const playerKey = this.redisClient.getPlayerCacheKey(this.gameId, this.username);
        const playerStats: IPlayerStat1 | null = await this.redisClient.getOne(playerKey);
        if (!playerStats) {
            return;
        }
        playerStats.active = false;
        await this.redisClient.set(playerKey, playerStats);

        // Notify others that this player has left the game
        this.socket.to(this.gameId).emit(GAME_EVENTS.PLAYER_LEFT, playerStats);

        // Remove the player from the room
        this.socket.leave(this.gameId);

        Logger.info(`User disconnected: ${this.username}`);
    }
}

export default SocketHelper;
