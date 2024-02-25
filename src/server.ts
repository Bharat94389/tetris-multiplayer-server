import express, { Request, Response, NextFunction, Express } from 'express';
import http from 'http';
import cors from 'cors';
import { Server as HttpServer } from 'http';
import path from 'path';

import Socket from './socket';
import { errorHandler, authHandler, requestLogger, responseLogger } from './middleware';
import { Payload, logger } from './utils';
import { AuthenticationRouter, GameRouter } from './router';

interface AuthenticatedRequest extends Request {
    user: Payload;
}

class Server {
    port: number;
    app: Express;
    httpServer: HttpServer;
    socket: Socket;

    constructor({ port }: { port: number }) {
        this.port = port;

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
        this.app.use(express.static('src/web'));
        this.app.use(cors());
        this.app.use(express.json());

        this.app.use(requestLogger);
        this.app.use(responseLogger);
    }

    setUIRoutes() {
        this.app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'web', 'index.html')));
        this.app.get('/login', (req, res) =>
            res.sendFile(path.join(__dirname, 'web', 'login.html'))
        );
        this.app.get('/signup', (req, res) =>
            res.sendFile(path.join(__dirname, 'web', 'signup.html'))
        );
        this.app.get('/game/:gameId', (req, res) => res.sendFile(path.join(__dirname, 'web', 'game.html')));
    }

    setApiRoutes() {
        this.app.use('/api', new AuthenticationRouter().router);
        this.app.use('/api', authHandler);
        this.app.use('/api/game', new GameRouter().router);
    }

    setPostRequestHandlers() {
        this.app.use(errorHandler);
    }

    listen() {
        this.httpServer.listen(this.port, '0.0.0.0', () => {
            logger.info(`Server running on port: ${this.port}`);
        });
    }
}

export default Server;

export { HttpServer, AuthenticatedRequest, Request, Response, NextFunction, Express };
