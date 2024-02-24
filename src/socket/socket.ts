import { Server, Socket as IoSocket } from 'socket.io';
import { logger } from '../utils';
import { HttpServer } from '../server';
import SocketHelper from './socketHelper';
import { authHandler } from '../middleware';
import { GAME_EVENTS } from '../constants';

interface ConstructorParams {
    httpServer: HttpServer;
}

class Socket {
    io: Server;

    constructor({ httpServer }: ConstructorParams) {
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
        authHandler({ headers: { authorization: `Bearer ${token}` } } as any, {} as any, next);
    }

    async setupSocket(socket: IoSocket) {
        const gameId = socket.handshake['query']['gameId'];
        if (!gameId || Array.isArray(gameId)) {
            return;
        }
        const socketHelper = new SocketHelper({ socket, gameId });

        await socketHelper.joinGame();

        socket.on(GAME_EVENTS.START_GAME, () => socketHelper.startGame());
        socket.on('disconnect', () => socketHelper.disconnect());
    }
}

export default Socket;

export { IoSocket };
