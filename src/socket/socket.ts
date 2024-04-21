import { Server } from 'socket.io';
import SocketHelper from './socketHelper';
import { authHandler } from '../middleware';
import { logger } from '../utils';
import { GAME_EVENTS } from '../constants';
import { IoSocket, TSocketParams } from './scoket.types';
import { TRequest, TResponse } from '../server.types';

class Socket {
    io: Server;

    constructor({ httpServer }: TSocketParams) {
        this.io = new Server(httpServer, {
            cors: {
                methods: ['GET', 'POST'],
            },
        });

        this.io.use(this.authenticate);
        this.io.on('connection', this.setupSocket);
    }

    authenticate(socket: IoSocket, next: any) {
        logger.info('Socket Connection Requested', {
            'user-agent': socket.handshake.headers['user-agent'],
            host: socket.handshake.headers.host,
        });
        const token: string = socket.handshake.auth.token;
        authHandler(
            { headers: { authorization: `Bearer ${token}` } } as TRequest,
            {} as TResponse,
            next
        );
    }

    async setupSocket(socket: IoSocket) {
        const gameId = socket.handshake['query']['gameId'];
        if (!gameId || Array.isArray(gameId)) {
            return;
        }
        const socketHelper = new SocketHelper({ socket, gameId });

        await socketHelper.joinGame();

        socket.on(GAME_EVENTS.START_GAME, () => socketHelper.startGame());
        socket.on(GAME_EVENTS.GAME_OVER, () => socketHelper.gameOver());
        socket.on(GAME_EVENTS.NEXT_PIECE, (data) => socketHelper.nextPiece(data));
        socket.on(GAME_EVENTS.SCORE_UPDATE, (data) => socketHelper.scoreUpdate(data));
        socket.on('disconnect', () => socketHelper.disconnect());
    }
}

export default Socket;
