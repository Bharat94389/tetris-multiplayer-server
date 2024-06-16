import { BaseError } from './base.error';
import { HTTP_STATUS_CODES } from '../constants';

export class OperationalError extends BaseError {
    constructor(message: string, args = {}) {
        super(message, HTTP_STATUS_CODES.UNEXPECTED, args);
    }
}
