class AppError extends Error {
    constructor({ message, status, args }) {
        super();

        this.message = message;
        this.status = status;
        this.args = args;
    }
}

module.exports = { AppError };
