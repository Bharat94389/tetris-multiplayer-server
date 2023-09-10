import { AppError } from '../utils';
import { Database } from '../types';

class BaseValidator {
    database: Database;

    constructor({ database }: { database: Database}) {
        this.database = database;
    }

    error({ message, status = 400, args }: { message: string; status?: number; args?: Object }) {
        throw new AppError({ message, args, status });
    }

    validate(args: Object) {
        throw Error('To be implemented');
    }
}

export default BaseValidator;
