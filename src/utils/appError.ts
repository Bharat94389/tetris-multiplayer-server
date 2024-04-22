import { IAppError, TAppErrorParams } from './appError.types';

class AppError implements IAppError {
    name: string = 'AppError';
    message: string;
    stack?: string;
    status: number;
    args?: any;

    constructor({ message, stack, status = 500, args }: TAppErrorParams) {
        this.message = message;
        this.status = status;
        this.stack = stack;
        this.args = args;
    }
}

export default AppError;
