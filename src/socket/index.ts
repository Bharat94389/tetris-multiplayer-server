import { Server } from 'socket.io';
import { logger } from '../utils';
import { Database, HttpServer } from '../types';

class Socket {
    database: Database;
    io: any;

    constructor({ httpServer, database }: { httpServer: HttpServer; database: Database }) {
        this.database = database;
        this.io = new Server(httpServer, {
            cors: {
                methods: ['GET', 'POST'],
            },
        });

        this.io.on('connect', this.setupSocket);
    }

    setupSocket(socket: any) {
        logger.info(`User connected: ${socket.id}`);

        socket.on('game', (data: Object) => {
            console.log(data);
            socket.emit('send_message', 'Hi');
        });

        socket.on('disconnect', () => {
            logger.info(`User disconnected: ${socket.id}`);
        });
    }
}

export default Socket;
