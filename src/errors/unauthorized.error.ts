import { BaseError } from './base.error';
import { HTTP_STATUS_CODES } from '../constants';

export class UnauthorizedError extends BaseError {
    constructor(message: string, args: any = {}) {
        super(message, HTTP_STATUS_CODES.UNAUTHORIZED, args);
    }
}
