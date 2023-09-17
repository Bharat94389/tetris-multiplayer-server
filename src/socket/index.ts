import { Server } from 'socket.io';
import { logger } from '../utils';
import { Database, HttpServer, IoSocket } from '../types';

class Socket {
    database: Database;
    io: Server;

    constructor({ httpServer, database }: { httpServer: HttpServer; database: Database }) {
        this.database = database;
        this.io = new Server(httpServer, {
            cors: {
                methods: ['GET', 'POST'],
            },
        });

        this.io.on('connect', this.setupSocket);
    }

    setupSocket(socket: IoSocket) {
        logger.info(`User connected: ${socket.id}`);

        socket.on('game', (data: any) => {
            console.log(data);
            socket.emit('send_message', 'changed');
        });

        socket.on('disconnect', () => {
            logger.info(`User disconnected: ${socket.id}`);
        });
    }
}

export default Socket;
