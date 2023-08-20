const authHandler = require('./preRequestHandlers/authHandler');
const requestLogger = require('./preRequestHandlers/requestLogger');
const errorHandler = require('./postRequestHandlers/errorHandler');
const responseLogger = require('./postRequestHandlers/responseLogger');

module.exports = {
    authHandler,
    requestLogger,
    errorHandler,
    responseLogger,
};
