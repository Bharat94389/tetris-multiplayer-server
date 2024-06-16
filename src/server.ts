import express, { Express } from 'express';
import { rateLimit } from 'express-rate-limit';
import http, { Server as HttpServer } from 'http';
import cors from 'cors';
import path from 'path';

import Socket from './socket';
import { errorHandler, authHandler, requestLogger, responseLogger } from './middlewares';
import { Logger } from './utils';
import { IocContainer } from './ioc/iocContainer';
import { serverConfig } from './config';
import { ServicesEnum } from './ioc/createContainer';

export class Server {
    app: Express;
    httpServer: HttpServer;
    socket: Socket;

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

        this.httpServer = http.createServer(this.app);
        this.socket = new Socket(this.httpServer, this.container);

        this.setPostRequestHandlers();
        this.listen();
    }

    setMiddleware() {
        this.app.use(cors());
        this.app.use(
            rateLimit({
                windowMs: 15 * 60 * 1000, // 15 minutes
                limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
                standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
                legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
            })
        );
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
