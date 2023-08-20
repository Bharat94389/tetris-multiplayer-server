const BaseValidator = require('./baseValidator');

class UserDataValidator extends BaseValidator {
    validate({ email, username, password }) {
        if (!email) {
            this.error({ message: 'Email not provided' });
        }
        if (!username) {
            this.error({ message: 'Username not provided' });
        }
        if (!password) {
            this.error({ message: 'Password not provided' });
        }

        // TODO: create user object in db

        return {
            email,
            username,
            password,
        };
    }
}

module.exports = UserDataValidator;
