import {
    Response as TResponse,
    Request,
    NextFunction as TNextFunction,
} from 'express';
import { TPayload } from './utils/jwt';

type TRequest = Request & {
    user?: TPayload;
};

type TRequestInfo = {
    user?: TPayload;
    params: any;
    body: any;
    url: string;
};

export {
    TNextFunction,
    TRequest,
    TResponse,
    TRequestInfo,
};
