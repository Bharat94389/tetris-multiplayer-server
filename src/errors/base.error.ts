export class BaseError extends Error {
    statusCode: number;
    args: any;

    constructor (message: string, statusCode: number, args: any) {
        super(message);

        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.args = args;
    }
}
