interface ConstructorParams {
    message: string;
    status?: number;
    args?: Object;
}

class AppError extends Error {
    message: string;
    status: number;
    args: Object | undefined;

    constructor({ message, status = 500, args }: ConstructorParams) {
        super();

        this.message = message;
        this.status = status;
        this.args = args;
    }
}

export default AppError;
