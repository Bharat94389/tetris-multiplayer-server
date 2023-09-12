import jwt from 'jsonwebtoken';
import SECRET_KEY from '../constants';

class JWT {
    generate(user: Object) {
        if (user) {
            return jwt.sign(user, SECRET_KEY);
        }
        return null;
    }

    verify(token: string) {
        if (!token) {
            return null;
        }
        return jwt.verify(token, SECRET_KEY, (err: Error, data: Object) => (err ? null : data));
    }
}

export default new JWT();
