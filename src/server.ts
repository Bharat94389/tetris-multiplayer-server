import express from 'express';
import http from 'http';
import cors from 'cors';

import Socket from './socket';
import { errorHandler, authHandler, requestLogger, responseLogger } from './middleware';
import { logger } from './utils';
import { AuthenticationRouter } from './router';
import { Database, HttpServer, Express } from './types';

class Server {
    port: number;
    database: Database;
    app: Express;
    httpServer: HttpServer;
    socket: Socket;

    constructor({ port, database }: { port: number; database: Database }) {
        this.port = port;
        this.database = database;

        this.app = express();
        this.setMiddleware();
        this.setRoutes();
        this.setPostRequestHandlers();

        this.httpServer = http.createServer(this.app);
        this.socket = new Socket({ httpServer: this.httpServer, database });

        this.listen();
    }

    setMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());

        this.app.use(requestLogger);
    }

    setRoutes() {
        this.app.use('/auth', new AuthenticationRouter({ database: this.database }).router);
        this.app.use('/', authHandler);
    }

    setPostRequestHandlers() {
        this.app.use(errorHandler);
        this.app.use(responseLogger);
    }

    listen() {
        this.httpServer.listen(this.port, () => {
            logger.info(`Server running on port: ${this.port}`);
        });
    }
}

export default Server;
