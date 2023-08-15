const BaseValidator = require('./baseValidator');

class CredentialsValidator extends BaseValidator {
    validate({ username, password }) {
        if (!username) {
            this.error({ message: 'Username not provided' });
        }
        if (!password) {
            this.error({ message: 'Password not provided' });
        }

        return {
            username,
            password,
        };
    }
}

module.exports = CredentialsValidator;
