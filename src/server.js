const express = require('express');
const http = require('http');
const cors = require('cors');

const AppRouter = require('./router');
const Socket = require('./socket');
const { errorHandler, authHandler, requestLogger, responseLogger } = require('./middleware');
const { logger } = require('./utils');

class Server {
    constructor({ port, database, secretKey }) {
        this.port = port;
        this.database = database;
        this.secretKey = secretKey;

        this.app = express();
        this.server = http.createServer(this.app);
        this.socket = new Socket({ server: this.server, database });
        this.setMiddleware();
        this.setRoutes();
        this.setPostRequestHandlers();
        this.listen();
    }

    setMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());

        this.app.use(requestLogger);
    }

    setRoutes() {
        this.app.use(
            '/',
            new AppRouter({
                database: this.database,
                secretKey: this.secretKey,
            }).openRouter
        );

        this.app.use(
            '/',
            authHandler,
            new AppRouter({
                database: this.database,
                secretKey: this.secretKey,
            }).closedRouter
        );
    }

    setPostRequestHandlers() {
        this.app.use(errorHandler);
        this.app.use(responseLogger);
    }

    listen() {
        this.server.listen(this.port, () => {
            logger.info({ message: `Server running on port: ${this.port}` });
        });
    }
}

module.exports = Server;
