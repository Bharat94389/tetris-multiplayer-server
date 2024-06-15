import jwt from 'jsonwebtoken';

type TPayload = {
    email: string;
    username: string;
};

export class JWT {
    private static readonly secretKey = String(process.env.SECRET_KEY);

    static generate({ email, username }: TPayload): string {
        return jwt.sign({ email, username }, this.secretKey, { expiresIn: '1d' });
    }

    static verify(token: string): null | TPayload {
        const payload = jwt.verify(token, this.secretKey);
        if (!payload || typeof payload === 'string') {
            return null;
        }
        return { email: payload.email, username: payload.username };
    }

    static parse(token: string): TPayload | null {
        const payload = jwt.decode(token);
        if (!payload || typeof payload === 'string') {
            return null;
        }
        return {
            email: payload.email,
            username: payload.username,
        };
    }
}
