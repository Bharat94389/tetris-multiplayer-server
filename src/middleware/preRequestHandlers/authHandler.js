const { jwt, logger } = require('../../utils');

const authHandler = (req, res, next) => {
    if (req.headers.authorization) {
        const [authType, token] = req.headers.authorization.split(' ');

        if (authType === 'Bearer' && token) {
            const userData = jwt.verify(token);
            if (userData) {
                req.user = userData;
                return next();
            }
        }
    }

    res.sendStatus(401).end();
    logger.info({
        args: {
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            url: res.url,
            method: res.method,
        },
    });
};

module.exports = authHandler;
