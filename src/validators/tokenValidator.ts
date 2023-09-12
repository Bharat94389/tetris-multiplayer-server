import { jwt } from '../utils';
import BaseValidator from './baseValidator';

class TokenValidator extends BaseValidator {
    validate({ token }: { token: string }) {
        const userData: Object = jwt.verify(token);

        // TODO: Validate user found in userData

        return userData;
    }
}

export default TokenValidator;
