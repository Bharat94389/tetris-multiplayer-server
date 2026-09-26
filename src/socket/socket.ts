import { Server, Socket as IoSocket } from 'socket.io';
import { Server as HttpServer } from 'http';
import SocketHelper from './socketHelper';
import { authHandler } from '../middlewares';
import { TRequest, TResponse } from '../server.types';
import { IocContainer } from '../ioc/iocContainer';
import { ServicesEnum } from '../ioc/createContainer';
import { Logger } from '../utils';
import { GAME_EVENTS } from '../constants';

export class Socket {
    io: Server;

    constructor(
        httpServer: HttpServer,
        private container: IocContainer
    ) {
        this.io = new Server(httpServer, {
            cors: {
                methods: ['GET', 'POST'],
            },
            adapter: this.container[ServicesEnum.redisClient].createSocketAdapter(),
        });

        this.io.use(this.authenticate.bind(this));
        this.io.on('connection', this.setupSocket.bind(this));
    }

    authenticate(socket: IoSocket, next: any) {
        Logger.info('Socket Connection Requested', {
            'user-agent': socket.handshake.headers['user-agent'],
            host: socket.handshake.headers.host,
        });
        const token: string = socket.handshake.auth.token;
        const req = { headers: { authorization: `Bearer ${token}` } } as TRequest;
        authHandler(req, {} as TResponse, next);
        socket.data = req.user;
    }

    async setupSocket(socket: IoSocket) {
        const gameId = socket.handshake['query']['gameId'];
        if (!gameId || Array.isArray(gameId)) {
            return;
        }
        socket.data.gameId = gameId;
        const socketHelper = new SocketHelper(
            socket,
            this.container[ServicesEnum.redisClient],
            this.container[ServicesEnum.gameModel],
            this.container[ServicesEnum.playerStatModel]
        );

        // Handle the events of a socket one at a time, in the order they were sent, so the
        // read-modify-write updates of the cached player stats cannot overwrite each other
        let queue = Promise.resolve();
        const enqueue = (handler: () => Promise<void>) => {
            queue = queue.then(handler).catch((err) => Logger.error(err.message, err.stack));
        };

        enqueue(() => socketHelper.joinGame());

        socket.on(GAME_EVENTS.START_GAME, () => enqueue(() => socketHelper.startGame()));
        socket.on(GAME_EVENTS.GAME_OVER, () => enqueue(() => socketHelper.gameOver()));
        socket.on(GAME_EVENTS.NEXT_PIECE, (data) => enqueue(() => socketHelper.nextPiece(data)));
        socket.on(GAME_EVENTS.SCORE_UPDATE, (data) =>
            enqueue(() => socketHelper.scoreUpdate(data))
        );
        socket.on(GAME_EVENTS.CHANGE_ROLE, (data) => enqueue(() => socketHelper.changeRole(data)));
        socket.on(GAME_EVENTS.KICK_USER, (data) => enqueue(() => socketHelper.kickUser(data)));
        // sent many times a second and changes no state, so it does not wait in the queue
        socket.on(GAME_EVENTS.PIECE_UPDATE, (data) => socketHelper.pieceUpdate(data));

        socket.on('disconnect', () => enqueue(() => socketHelper.disconnect()));
    }
}
