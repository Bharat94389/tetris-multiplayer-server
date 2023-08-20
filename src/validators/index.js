const CredentialsValidator = require('./credentialsValidator');
const TokenValidator = require('./tokenValidator');
const UserDataValidator = require('./userDataValidator');

class Validator {
    constructor({ database, secretKey }) {
        this.database = database;
    }

    get userDataVaidator() {
        return new UserDataValidator({ database: this.database });
    }

    get credentialsValidator() {
        return new CredentialsValidator({ database: this.database });
    }

    get tokenValidator() {
        return new TokenValidator({ database: this.database });
    }
}

module.exports = Validator;
