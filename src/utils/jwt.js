const jwt = require('jsonwebtoken');
const { secretKey } = require('../constants');

class JWT {
    generate(user) {
        if (user) {
            return jwt.sign(user, secretKey);
        }
        return null;
    }

    verify(token) {
        if (!token) {
            return null;
        }
        return jwt.verify(token, secretKey, (err, data) => (err ? null : data));
    }
}

module.exports = { JWT };
