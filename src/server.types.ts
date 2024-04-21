import {
    Response as TResponse,
    Request,
    NextFunction as TNextFunction,
    Router as TRouter,
    Express as TExpress,
} from 'express';
import { Server as THttpServer } from 'http';
import { TPayload } from './utils/jwt.types';
import { ISocket } from './socket/scoket.types';

type TRequest = Request & {
    user?: TPayload;
};

type TAuthenticatedRequest = Request & {
    user: TPayload;
};

interface IServer {
    port: number;
    app: TExpress;
    httpServer: THttpServer;
    socket: ISocket;

    listen(): void;
}

export {
    IServer,
    TExpress,
    THttpServer,
    TAuthenticatedRequest,
    TNextFunction,
    TRequest,
    TResponse,
    TRouter,
};
