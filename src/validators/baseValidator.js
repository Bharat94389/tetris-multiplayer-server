const { AppError } = require('../utils');

class BaseValidator {
    constructor({ database }) {
        this.database = database;
    }

    error({ message, status = 400, args }) {
        throw new AppError({ message, args, status });
    }

    validate(args) {
        throw Error('To be implemented');
    }
}

module.exports = BaseValidator;
