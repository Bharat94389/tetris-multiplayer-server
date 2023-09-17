import jwt from 'jsonwebtoken';
import constants from '../constants';

class JWT {
    generate(user: Object) {
        if (user) {
            return jwt.sign(user, constants.SECRET_KEY);
        }
        return null;
    }

    verify(token: string) {
        try {
            return jwt.verify(token, constants.SECRET_KEY);
        } finally {
            return null;
        }
    }
}

export default new JWT();
