const express = require('express');
const http = require('http');
const cors = require('cors');

const Router = require('./router');
const Socket = require('./socket');
const { errorHandler } = require('./middleware');

class Server {
    constructor({ port, database }) {
        this.port = port;
        this.database = database;

        this.app = express();
        this.server = http.createServer(this.app);
        this.socket = new Socket({ server: this.server, database: this.database });
        this.setMiddleware();
        this.setRoutes();
        this.setErrorHandler();
        this.listen();
    }

    setMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
    }

    setRoutes() {
        this.app.use(
            '/',
            new Router({
                database: this.database,
                Router: express.Router,
            }).getRoutes()
        );
    }

    setErrorHandler() {
        this.app.use(errorHandler);
    }

    listen() {
        this.server.listen(this.port, () => {
            console.log(`Server running on port: ${this.port}`);
        });
    }
}

module.exports = Server;
