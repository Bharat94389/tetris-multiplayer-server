import { IoSocket } from './socket';
import { jwt, logger } from '../utils';
import { Game } from '../database';
import { GAME_EVENTS, GAME_STATUS, GAME_CONSTANTS } from '../constants';
import { GameSchema } from '../database/schema';

interface UserData {
    email: string;
    username: string;
}

class SocketHelper {
    socket: IoSocket;
    gameCache: Map<string, GameSchema>;
    playersCache: Map<string, any>;
    userData: UserData;

    constructor({ socket }: { socket: IoSocket }) {
        logger.info(`User connected: ${socket.id}`);
        this.socket = socket;
        this.userData = jwt.parse(socket.handshake.auth.token);

        this.gameCache = new Map();
        this.playersCache = new Map();
    }

    startGame({ gameId }: { gameId: string }) {
        if (this.gameCache.has(gameId)) {
            const game = this.gameCache.get(gameId);
            if (game && game.status === GAME_STATUS.WAITING) {
                game.status = GAME_STATUS.IN_PROGRESS;
            }
        }
    }

    async createNewGame() {
        const newGame = await new Game({ owner: this.userData.username }).create();
        this.gameCache.set(newGame.gameId, newGame);
        this.socket.emit(GAME_EVENTS.NEW_GAME, newGame);
    }

    nextPiece() {
        const pieces = Object.values(GAME_CONSTANTS.PIECES);
        const randomPiece = pieces[Math.floor(Math.random() * 100 % pieces.length)];
        return randomPiece;
    }

    disconnect() {
        logger.info(`User disconnected: ${this.socket.id}`);
    }
}

export default SocketHelper;
