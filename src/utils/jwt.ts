import jwt from 'jsonwebtoken';
import constants from '../constants';
import { User } from '../database';

interface GenerateParams {
    username: string;
    password: string;
    email: string;
}

interface Payload {
    username: string;
    email: string;
}

class JWT {
    async generate({ username, email, password }: GenerateParams): Promise<string | null> {
        const user = await new User({}).get({ username, password });
        if (user) {
            return jwt.sign({ username, email }, constants.SECRET_KEY);
        }
        return null;
    }

    verify(token: string): null | Payload {
        try {
            const payload = jwt.verify(token, constants.SECRET_KEY);
            if (typeof payload === 'string') {
                return null;
            }
            return { username: payload.username, email: payload.email };
        } catch {
            return null;
        }
    }
}

export default new JWT();
