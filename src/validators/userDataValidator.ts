import BaseValidator from './baseValidator';

class UserDataValidator extends BaseValidator {
    validate({ email, username, password }: { email: string; username: string; password: string }) {
        // TODO: create user object in db

        return {
            email,
            username,
            password,
        };
    }
}

export default UserDataValidator;
