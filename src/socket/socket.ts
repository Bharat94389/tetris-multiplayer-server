import { Server, Socket as IoSocket } from 'socket.io';
import { logger } from '../utils';
import { HttpServer } from '../server';
import SocketHelper from './socketHelper';

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

        this.io.on('connect', this.setupSocket);
    }

    setupSocket(socket: IoSocket): void {
        const socketHelper = new SocketHelper({ socket });

        socket.on('START_GAME', (res) => {
            console.log(res);
        });

        socket.on('disconnect', () => socketHelper.disconnect());
    }
}

export default Socket;

export { IoSocket };
