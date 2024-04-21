import jwt from 'jsonwebtoken';
import AppError from './appError';
import { IJWT, TPayload } from './jwt.types';

class JWT implements IJWT {
    readonly secretKey = String(process.env.SECRET_KEY);

    async generate({ email, username }: TPayload): Promise<string> {
        return jwt.sign({ email, username }, this.secretKey, { expiresIn: '1d' });
    }

    verify(token: string): null | TPayload {
        try {
            const payload = jwt.verify(token, this.secretKey);
            if (typeof payload === 'string') {
                return null;
            }
            return { email: payload.email, username: payload.username };
        } catch {
            return null;
        }
    }

    parse(token: string): TPayload {
        const payload = jwt.decode(token);
        if (!payload || typeof payload === 'string') {
            throw new AppError({ message: 'Invalid Token' });
        }
        return {
            email: payload.email,
            username: payload.username,
        };
    }
}

export default new JWT();
