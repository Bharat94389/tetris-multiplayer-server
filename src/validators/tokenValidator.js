const { jwt } = require('../utils');
const BaseValidator = require('./baseValidator');

class TokenValidator extends BaseValidator {
    validate(token) {
        if (!token) {
            this.error({ message: 'Token not provided' });
        }
        const userData = jwt.verify(token);

        // TODO: Validate user found in userData

        return userData;
    }
}

module.exports = TokenValidator;
