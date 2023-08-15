const BaseValidator = require('./baseValidator');

class TokenValidator extends BaseValidator {
    validate({ token }) {
        if (!token) {
            this.error({ message: 'Token not provided' });
        }

        return {
            token,
        };
    }
}

module.exports = TokenValidator;
