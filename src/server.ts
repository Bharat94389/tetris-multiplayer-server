import express, { Request as ExpressRequest, Response, NextFunction, Express } from 'express';
import http from 'http';
import cors from 'cors';
import { Server as HttpServer } from 'http';

import Socket from './socket';
import { errorHandler, authHandler, requestLogger, responseLogger } from './middleware';
import { logger } from './utils';
import { AuthenticationRouter } from './router';

interface Request extends ExpressRequest {
    user?: any;
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
        this.setRoutes();
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

    setRoutes() {
        this.app.use('/', new AuthenticationRouter().router);
        this.app.use('/', authHandler);
    }

    setPostRequestHandlers() {
        this.app.use(errorHandler);
    }

    listen() {
        this.httpServer.listen(this.port, () => {
            logger.info(`Server running on port: ${this.port}`);
        });
    }
}

export default Server;

export { HttpServer, Request, Response, NextFunction, Express };
