import BaseValidator from './baseValidator';
import { jwt } from '../utils';

class CredentialsValidator extends BaseValidator {
    validate({ username, password }: { username: string; password: string }) {
        // TODO: Add logic to verify user from database

        const token: string = jwt.generate({ username, password });
        return { token };
    }
}

export default CredentialsValidator;
