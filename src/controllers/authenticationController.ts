import { CredentialsValidator, TokenValidator, UserDataValidator } from '../validators';
import { Database } from '../types';

class AuthenticationController {
    userDataValidator: UserDataValidator;
    tokenValidator: TokenValidator;
    credentialsValidator: CredentialsValidator;

    constructor({ database }: { database: Database }) {
        this.userDataValidator = new UserDataValidator({ database });
        this.tokenValidator = new TokenValidator({ database });
        this.credentialsValidator = new CredentialsValidator({ database });
    }

    async login({ username, password }: { username: string; password: string }) {
        const validatedData = await this.credentialsValidator.validate({ username, password });
        return validatedData;
    }

    async verify({ token }: { token: string }) {
        const validatedUserDetails = await this.tokenValidator.validate({ token });
        return validatedUserDetails;
    }

    async signup({
        email,
        username,
        password,
    }: {
        email: string;
        username: string;
        password: string;
    }) {
        const validatedData = await this.userDataValidator.validate({
            email,
            username,
            password,
        });
        return validatedData;
    }
}

export default AuthenticationController;
