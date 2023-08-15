const { AppError } = require('../utils');

class BaseValidator {
    constructor({ database }) {
        this.database = database;
    }

    error({ message, status, args }) {
        throw new AppError({
            message,
            args,
            status,
        });
    }

    validate(args) {
        return args;
    }
}

module.exports = BaseValidator;
