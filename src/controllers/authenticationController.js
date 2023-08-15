class AuthenticationController {
    constructor({ userDataVaidator, tokenValidator, credentialsValidator }) {
        this.userDataVaidator = userDataVaidator;
        this.tokenValidator = tokenValidator;
        this.credentialsValidator = credentialsValidator;
    }

    async login({ credentials }) {
        const validatedData = await this.credentialsValidator.validate(credentials);
        return validatedData;
    }

    async verify({ token }) {
        const validatedUserDetails = await this.tokenValidator.validate(token);
        return validatedUserDetails;
    }

    async signup({ userData }) {
        const validatedData = await this.userDataValidator.validate(userData);
        return validatedData;
    }
}

module.exports = AuthenticationController;
