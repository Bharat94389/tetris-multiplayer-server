interface ConstructorParams {
    message: string;
    status?: number;
    args?: Object;
}

class AppError extends Error {
    message: string;
    status: number;
    args: Object | undefined;

    constructor({ message, status, args }: ConstructorParams) {
        super();

        this.message = message;
        this.status = status || 500;
        this.args = args;
    }
}

export default AppError;
