import { Server } from 'socket.io';
import { logger } from '../utils';
import { HttpServer, IoSocket } from '../types';

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
        logger.info(`User connected: ${socket.id}`);

        socket.on('game', (data: any) => {
            console.log(data);
        });

        socket.on('disconnect', () => {
            logger.info(`User disconnected: ${socket.id}`);
        });
    }
}

export default Socket;
