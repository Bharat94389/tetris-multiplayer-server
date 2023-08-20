const AuthenticationController = require('./authenticationController');
const Validator = require('../validators');

class Controller {
    constructor({ database, secretKey }) {
        this.database = database;

        this.validator = new Validator({ database, secretKey });
    }

    get authenticationController() {
        return new AuthenticationController({
            userDataVaidator: this.validator.userDataVaidator,
            credentialsValidator: this.validator.credentialsValidator,
            tokenValidator: this.validator.tokenValidator,
        });
    }
}

module.exports = Controller;
