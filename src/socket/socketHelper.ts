import { Socket as IoSocket } from 'socket.io';
import { IRedisClient, Logger, isValidBoard, isValidPiece, nextNPieces } from '../utils';
import { GAME_CONSTANTS, GAME_EVENTS, GAME_STATUS, ROLES } from '../constants';
import { IPlayerStat, IGame } from '../database/schema';
import { GameModel, PlayerStatModel } from '../database/models';

interface IPlayerStat1 extends IPlayerStat {
    active?: boolean;
}

// Spectators only live in the redis cache, they have no stats to store
interface ISpectator {
    username: string;
    active?: boolean;
}

type TRole = (typeof ROLES)[keyof typeof ROLES];

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

    // Room of the spectators and the players who are out, the only ones sent the falling pieces
    get watchersRoom() {
        return `${this.gameId}:watchers`;
    }

    // Room of all the sockets of a user, so they can be reached from any server
    getUserRoom(username: string) {
        return `${this.gameId}:user:${username}`;
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

        const bannedKey = this.redisClient.getBannedCacheKey(this.gameId);
        if (await this.redisClient.isSetMember(bannedKey, this.username)) {
            this.socket.emit(GAME_EVENTS.USER_KICKED, { username: this.username });
            this.socket.disconnect(true);
            return;
        }

        // Join game room
        this.socket.join([this.gameId, this.getUserRoom(this.username)]);

        // Users keep the role they had, only the host joins a game that has not started as a
        // player and once the game has started new users can only spectate
        let player = await this.activate<IPlayerStat1>(
            this.redisClient.getPlayerCacheKey(this.gameId, this.username)
        );
        let spectator: ISpectator | null = null;
        if (!player) {
            spectator = await this.activate<ISpectator>(
                this.redisClient.getSpectatorCacheKey(this.gameId, this.username)
            );
        }
        if (!player && !spectator) {
            if (gameData.owner === this.username && gameData.status === GAME_STATUS.WAITING) {
                player = await this.createPlayer(this.username);
            } else {
                spectator = await this.createSpectator(this.username);
            }
        }
        const role: TRole = player ? ROLES.PLAYER : ROLES.SPECTATOR;
        if (!player || player.gameOver) {
            this.socket.join(this.watchersRoom);
        }

        const currentPlayers = await this.getPlayers();
        const spectators = await this.getSpectators();

        // Send data to players
        this.socket.emit(GAME_EVENTS.GAME_DATA, { gameData, currentPlayers, spectators, role });
        if (player) {
            this.socket.to(this.gameId).emit(GAME_EVENTS.PLAYER_JOINED, player);
        } else {
            this.socket.to(this.gameId).emit(GAME_EVENTS.SPECTATOR_JOINED, spectator);
        }
    }

    async getPlayers(): Promise<IPlayerStat1[]> {
        const playersKey = this.redisClient.getPlayerCacheKey(this.gameId, '*');
        return await this.redisClient.getMany(playersKey);
    }

    async getSpectators(): Promise<ISpectator[]> {
        const spectatorsKey = this.redisClient.getSpectatorCacheKey(this.gameId, '*');
        return await this.redisClient.getMany(spectatorsKey);
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
        // the game needs someone online to play it
        const players = await this.getPlayers();
        if (!players.some((player) => player.active !== false)) {
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

    // Marks a cached player or spectator as active again, null if the user is not in the cache
    async activate<T extends { active?: boolean }>(key: string): Promise<T | null> {
        const data: T | null = await this.redisClient.getOne(key);
        if (data && !data.active) {
            data.active = true;
            await this.redisClient.set(key, data);
        }
        return data;
    }

    async createPlayer(username: string, active = true): Promise<IPlayerStat1> {
        const playerKey = this.redisClient.getPlayerCacheKey(this.gameId, username);
        const newPlayerStat: IPlayerStat1 = await this.playerStatModel.create({
            gameId: this.gameId,
            username,
        });
        newPlayerStat.active = active;
        await this.redisClient.set(playerKey, newPlayerStat);

        return newPlayerStat;
    }

    async createSpectator(username: string, active = true): Promise<ISpectator> {
        const spectatorKey = this.redisClient.getSpectatorCacheKey(this.gameId, username);
        const spectator: ISpectator = { username, active };
        await this.redisClient.set(spectatorKey, spectator);

        return spectator;
    }

    // Removes the player from the game, a player has no progress to keep before the game starts
    async removePlayer(username: string): Promise<IPlayerStat1 | null> {
        const playerKey = this.redisClient.getPlayerCacheKey(this.gameId, username);
        const player: IPlayerStat1 | null = await this.redisClient.getOne(playerKey);
        if (!player) {
            return null;
        }
        await this.redisClient.delete(playerKey);
        await this.playerStatModel.delete({ gameId: this.gameId, username });

        return player;
    }

    async removeSpectator(username: string): Promise<ISpectator | null> {
        const spectatorKey = this.redisClient.getSpectatorCacheKey(this.gameId, username);
        const spectator: ISpectator | null = await this.redisClient.getOne(spectatorKey);
        if (!spectator) {
            return null;
        }
        await this.redisClient.delete(spectatorKey);

        return spectator;
    }

    // Users can switch their own role before the game starts, the host can switch anyone's
    async changeRole({ role, username }: { role?: unknown; username?: unknown } = {}) {
        if (role !== ROLES.PLAYER && role !== ROLES.SPECTATOR) {
            return;
        }
        const target = typeof username === 'string' && username ? username : this.username;
        const gameData = await this.getGameData();
        if (!gameData || gameData.status !== GAME_STATUS.WAITING) {
            return;
        }
        if (target !== this.username && gameData.owner !== this.username) {
            return;
        }

        const userRoom = this.getUserRoom(target);
        if (role === ROLES.PLAYER) {
            const spectator = await this.removeSpectator(target);
            if (!spectator) {
                return;
            }
            const player = await this.createPlayer(target, spectator.active !== false);
            this.socket.nsp.in(userRoom).socketsLeave(this.watchersRoom);
            this.socket.nsp
                .to(this.gameId)
                .emit(GAME_EVENTS.ROLE_CHANGED, { username: target, role, player });
        } else {
            const player = await this.removePlayer(target);
            if (!player) {
                return;
            }
            const spectator = await this.createSpectator(target, player.active !== false);
            this.socket.nsp.in(userRoom).socketsJoin(this.watchersRoom);
            this.socket.nsp
                .to(this.gameId)
                .emit(GAME_EVENTS.ROLE_CHANGED, { username: target, role, spectator });
        }
    }

    // The host can remove anyone before the game starts, they cannot join this game again
    async kickUser({ username }: { username?: unknown } = {}) {
        if (typeof username !== 'string' || !username || username === this.username) {
            return;
        }
        const gameData = await this.getGameData();
        if (!gameData || gameData.owner !== this.username) {
            return;
        }
        if (gameData.status !== GAME_STATUS.WAITING) {
            return;
        }

        const bannedKey = this.redisClient.getBannedCacheKey(this.gameId);
        await this.redisClient.addToSet(bannedKey, username);
        await this.removePlayer(username);
        await this.removeSpectator(username);

        this.socket.nsp.to(this.gameId).emit(GAME_EVENTS.USER_KICKED, { username });
        this.socket.nsp.in(this.getUserRoom(username)).disconnectSockets(true);
    }

    async nextPiece({ pieceNumber }: { pieceNumber: number }) {
        const gameData = await this.getGameData();
        if (!gameData || !gameData.tSequence) {
            return;
        }
        // generate game pieces if needed, APPEND is atomic so players asking for pieces at the
        // same time still share one sequence (at worst an extra batch is added). Spectators are
        // only sent the current sequence
        const playerKey = this.redisClient.getPlayerCacheKey(this.gameId, this.username);
        const isPlayer = Boolean(await this.redisClient.getOne(playerKey));
        if (isPlayer && Number.isInteger(pieceNumber) && gameData.tSequence.length <= pieceNumber) {
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

        // players who are out can watch the players still in the game
        this.socket.nsp.in(this.getUserRoom(this.username)).socketsJoin(this.watchersRoom);

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

    // Sends the falling piece of a player to the watchers, it is not stored
    pieceUpdate(piece: unknown) {
        if (!isValidPiece(piece)) {
            return;
        }
        // the piece number lets watchers drop updates older than the board they have
        const { type, rotation, x, y, pieceNumber } = piece;
        this.socket.to(this.watchersRoom).emit(GAME_EVENTS.PIECE_UPDATE, {
            username: this.username,
            piece: { type, rotation, x, y, pieceNumber },
        });
    }

    async disconnect() {
        // Update player or spectator in redis cache
        const playerKey = this.redisClient.getPlayerCacheKey(this.gameId, this.username);
        const spectatorKey = this.redisClient.getSpectatorCacheKey(this.gameId, this.username);
        const playerStats: IPlayerStat1 | null = await this.redisClient.getOne(playerKey);
        const spectator: ISpectator | null = playerStats
            ? null
            : await this.redisClient.getOne(spectatorKey);
        if (playerStats) {
            playerStats.active = false;
            await this.redisClient.set(playerKey, playerStats);

            // Notify others that this player has left the game
            this.socket.to(this.gameId).emit(GAME_EVENTS.PLAYER_LEFT, playerStats);
        } else if (spectator) {
            spectator.active = false;
            await this.redisClient.set(spectatorKey, spectator);
            this.socket.to(this.gameId).emit(GAME_EVENTS.SPECTATOR_LEFT, spectator);
        } else {
            return;
        }

        // Remove the player from the room
        this.socket.leave(this.gameId);

        Logger.info(`User disconnected: ${this.username}`);
    }
}

export default SocketHelper;
