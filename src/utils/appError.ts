class AppError extends Error {
    message: string;
    status: number;
    args: Object|undefined;

    constructor({ message, status, args }: { message: string; status: number; args?: Object }) {
        super();

        this.message = message;
        this.status = status;
        this.args = args;
    }
}

export default AppError;
