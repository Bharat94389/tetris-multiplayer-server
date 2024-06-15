import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';

import Socket from './socket';
import { errorHandler, authHandler, requestLogger, responseLogger } from './middlewares';
import { Logger } from './utils';
import { IServer, TExpress, THttpServer } from './server.types';
import { ISocket } from './socket/socket.types';
import { IocContainer } from './ioc/iocContainer';
import { serverConfig } from './config';
import { ServicesEnum } from './ioc/createContainer';

export class Server implements IServer {
    app: TExpress;
    httpServer: THttpServer;
    socket: ISocket;

    constructor(
        private container: IocContainer,
        private config: typeof serverConfig
    ) {
        this.init();
    }

    init() {
        this.app = express();
        this.setMiddleware();
        this.setUIRoutes();
        this.setApiRoutes();
        this.setPostRequestHandlers();

        this.httpServer = http.createServer(this.app);
        this.socket = new Socket({ httpServer: this.httpServer });

        this.listen();
    }

    setMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());

        this.app.use(requestLogger);
        this.app.use(responseLogger);
    }

    setUIRoutes() {
        this.app.use(express.static('src/web'));

        this.app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'web', 'index.html')));
        this.app.get('/login', (req, res) =>
            res.sendFile(path.join(__dirname, 'web', 'login.html'))
        );
        this.app.get('/signup', (req, res) =>
            res.sendFile(path.join(__dirname, 'web', 'signup.html'))
        );
        this.app.get('/game/:gameId', (req, res) =>
            res.sendFile(path.join(__dirname, 'web', 'game.html'))
        );
    }

    setApiRoutes() {
        this.app.use('/api', this.container[ServicesEnum.authenticationRouter].getRouter());
        this.app.use('/api', authHandler);
        this.app.use('/api/game', this.container[ServicesEnum.gameRouter].getRouter());
    }

    setPostRequestHandlers() {
        this.app.use(errorHandler);
    }

    listen() {
        this.httpServer.listen(this.config.port, '0.0.0.0', () => {
            Logger.info(`Server running on port: ${this.config.port}`);
        });
    }
}
