import { BaseError } from './base.error';

export class UnauthorizedError extends BaseError {
    constructor(message: string, args: any = {}) {
        super(message, 401, args);
    }
}
