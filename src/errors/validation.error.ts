import { BaseError } from './base.error';

export class ValidationError extends BaseError {
    constructor(message: string, args: any = {}) {
        super(message, 400, args);
    }
}
