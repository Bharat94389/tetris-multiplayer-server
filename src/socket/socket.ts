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
        this.io.on('connect', this.setupSocket);
    }

    authenticate(socket: IoSocket, next: any) {
        logger.info('Socket Connection Requested', {
            'user-agent': socket.handshake.headers['user-agent'],
            host: socket.handshake.headers.host,
        });
        const token: string = socket.handshake.auth.token;
        authHandler({ headers: { authorization: `Bearer ${token}` } } as any, {} as any, next);
    }

    setupSocket(socket: IoSocket): void {
        const socketHelper = new SocketHelper({ socket });

        socket.on(GAME_EVENTS.NEW_GAME, () => socketHelper.createNewGame());

        socket.on('disconnect', () => socketHelper.disconnect());
    }
}

export default Socket;

export { IoSocket };
