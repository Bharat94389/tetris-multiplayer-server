import { IoSocket } from './socket';
import { logger } from '../utils';

class SocketHelper {
    socket: IoSocket;
    gameCache: Map<string, any>;

    constructor({ socket }: { socket: IoSocket }) {
        logger.info(`User connected: ${socket.id}`);
        this.socket = socket;

        this.gameCache = new Map();
    }

    newGame({ gameId }: { gameId: string }) {

    }

    startGame({ gameId }: { gameId: string }) {

    }

    disconnect() {
        logger.info(`User disconnected: ${this.socket.id}`);
    }
};

export default SocketHelper;
