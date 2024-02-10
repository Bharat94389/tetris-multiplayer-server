import { User } from '../database';
import { AppError, jwt } from '../utils';

interface LoginParams {
    email: string;
    password: string;
}

interface SignupParams {
    username: string;
    email: string;
    password: string;
}

class AuthenticationController {
    async login({ email, password }: LoginParams): Promise<{ token: string | null }> {
        if (!new User({ email, password }).authenticate()) {
            throw new AppError({ message: 'Unauthorized', status: 401 });
        }
        const token = await jwt.generate({ email });
        return { token };
    }

    async signup(userData: SignupParams): Promise<void> {
        await new User(userData).create();
    }
}

export default AuthenticationController;
