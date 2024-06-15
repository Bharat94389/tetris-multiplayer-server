import {
    Response as TResponse,
    Request,
    NextFunction as TNextFunction,
    Router as TRouter,
    Express as TExpress,
} from 'express';
import { Server as THttpServer } from 'http';
import { TPayload } from './utils/jwt.types';
import { ISocket } from './socket/socket.types';

type TRequest = Request & {
    user?: TPayload;
};

type TAuthenticatedRequest = Request & {
    user: TPayload;
};

type TRequestInfo = {
    user?: TPayload;
    params: any;
    body: any;
    url: string;
};

interface IServer {
    app: TExpress;
    httpServer: THttpServer;
    socket: ISocket;
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
    TRequestInfo,
};
