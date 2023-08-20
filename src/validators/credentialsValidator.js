const BaseValidator = require('./baseValidator');
const { jwt } = require('../utils');

class CredentialsValidator extends BaseValidator {
    validate({ username, password }) {
        if (!username) {
            this.error({ message: 'Username not provided' });
        }
        if (!password) {
            this.error({ message: 'Password not provided' });
        }

        // TODO: Add logic to verify user from database

        const token = jwt.generate({ username, password });
        return { token };
    }
}

module.exports = CredentialsValidator;
