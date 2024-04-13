import { COLLECTIONS } from '../constants';
import database from '../database';
import { TUser, User } from '../database/models';
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
    async login({ email, password }: LoginParams): Promise<{ token: string } | null> {
        try {
            const userData = (await database.findOne<TUser>(COLLECTIONS.USER, { email })) as User;
            if (!userData || !userData.compareHash(password)) {
                return null;
            }
            const token = await jwt.generate(userData);
            return { token };
        } catch (err: any) {
            throw new AppError({
                message: err.message,
                args: {
                    stack: err.stack,
                    email,
                },
            });
        }
    }

    async signup(userData: SignupParams): Promise<{ token: string } | null> {
        try {
            const user = new User(userData);
            user.encryptPassword();
            await database.create(COLLECTIONS.USER, user);

            const token = await jwt.generate(userData);
            return { token };
        } catch (err: any) {
            throw new AppError({
                message: err.message,
                args: {
                    stack: err.stack,
                },
            });
        }
    }
}

export { AuthenticationController };
