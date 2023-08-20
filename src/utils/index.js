const { AppError } = require('./appError');
const { Logger } = require('./logger');
const { JWT } = require('./jwt');

module.exports = {
    AppError,
    logger: new Logger(),
    jwt: new JWT(),
};
