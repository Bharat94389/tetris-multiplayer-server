import { User } from '../database';
import { AppError, jwt } from '../utils';

interface LoginParams {
    email: string;
    password: string;
}

interface VerifyParams {
    token: string;
}

interface SignupParams {
    email: string;
    password: string;
}

class AuthenticationController {
    async login({ email, password }: LoginParams): Promise<any> {
        const userData = await new User({}).get({ email, password });
        if (!userData) {
            throw new AppError({ message: 'Unauthorized', status: 401 });
        }
        const token = await jwt.generate(userData);
        return { token };
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

    async signup(userData: SignupParams): Promise<void> {
        const validatedUser = new User({ data: userData });

        if (!await validatedUser.create()) {
            throw new AppError({ message: 'Invalid user data', status: 400 });
        }
    }
}

export default AuthenticationController;
