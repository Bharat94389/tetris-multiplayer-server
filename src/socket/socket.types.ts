import { THttpServer } from '../server.types';
import { Socket as IoSocket } from 'socket.io';

type TSocketParams = {
    httpServer: THttpServer;
};

interface ISocket {
    authenticate(socket: IoSocket, next: any): void;
    setupSocket(socket: IoSocket): Promise<void>;
}

export { TSocketParams, ISocket, IoSocket };
