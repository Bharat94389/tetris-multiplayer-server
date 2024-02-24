import { User } from '../database/models';
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
        const user = new User({ email, password });
        if (!(await user.authenticate())) {
            throw new AppError({ message: 'Unauthorized', status: 401 });
        }
        const token = await jwt.generate({
            email: user.data?.email || '',
            username: user.data?.username || '',
        });
        return { token };
    }

    async signup(userData: SignupParams): Promise<void> {
        await new User(userData).create();
    }
}

export { AuthenticationController };
