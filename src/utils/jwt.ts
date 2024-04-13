import jwt from 'jsonwebtoken';
import AppError from './appError';

export interface Payload {
    email: string;
    username: string;
}

class JWT {
    secretKey = String(process.env.SECRET_KEY);

    async generate({ email, username }: Payload): Promise<string> {
        return jwt.sign({ email, username }, this.secretKey, { expiresIn: '1d' });
    }

    verify(token: string): null | Payload {
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

    parse(token: string): Payload {
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
