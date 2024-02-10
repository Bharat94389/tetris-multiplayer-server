import jwt from 'jsonwebtoken';
import { User } from '../database';

interface Payload {
    email: string;
}

class JWT {
    secretKey = String(process.env.SECRET_KEY);

    async generate({ email }: Payload): Promise<string | null> {
        const user = await User.findOne({ email });
        if (user) {
            return jwt.sign({ email }, this.secretKey);
        }
        return null;
    }

    verify(token: string): null | Payload {
        try {
            const payload = jwt.verify(token, this.secretKey);
            if (typeof payload === 'string') {
                return null;
            }
            return { email: payload.email };
        } catch {
            return null;
        }
    }
}

export default new JWT();
