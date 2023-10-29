import { User } from '../database';
import { AppError, jwt } from '../utils';

interface LoginParams {
    username: string;
    password: string;
}

interface VerifyParams {
    token: string;
}

interface SignupParams {
    email: string;
    username: string;
    password: string;
}

class AuthenticationController {
    async login({ username, password }: LoginParams): Promise<any> {
        const userData = await new User({}).get({ username, password });
        const token = await jwt.generate(userData);
        return { userData, token };
    }

    async verify({ token }: VerifyParams): Promise<any> {
        const data = jwt.verify(token);
        if (data) {
            await new User({}).update(data.email, { isVerified: true });
            return { verified: true };
        } else {
            throw new AppError({ message: 'Invalid token', status: 401 });
        }
    }

    async signup(userData: SignupParams): Promise<any> {
        const validatedUser = new User({ data: userData });

        const created: boolean = await validatedUser.create();
        if (!validatedUser.data) {
            throw new AppError({ message: 'Invalid user data' });
        }
        return { created };
    }
}

export default AuthenticationController;
