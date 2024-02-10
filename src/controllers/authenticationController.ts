import { User } from '../database';
import { UserSchema } from '../database/schema';
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
        const userData: UserSchema | null = await User.findOne({ email });
        if (!userData) {
            throw new AppError({ message: 'Unauthorized', status: 401 });
        }
        const user = new User(userData);
        if (!user.validatePassword(password)) {
            throw new AppError({ message: 'Unauthorized', status: 401 });
        }
        const token = await jwt.generate({ email });
        return { token };
    }

    async signup(userData: SignupParams): Promise<void> {
        const user = new User(userData);

        if (!(await user.create())) {
            throw new AppError({ message: 'Invalid user data', status: 400 });
        }
    }
}

export default AuthenticationController;
