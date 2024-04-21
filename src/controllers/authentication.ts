import database from '../database';
import { User } from '../database/models';
import { AppError, jwt } from '../utils';
import { COLLECTIONS } from '../constants';
import { IAuthenticationController, TLoginParams, TSignupParams } from './authentication.types';
import { IUser } from '../database/models/user.types';

class AuthenticationController implements IAuthenticationController {
    async login({ email, password }: TLoginParams): Promise<{ token: string } | null> {
        try {
            const userData = (await database.findOne<IUser>(COLLECTIONS.USER, { email })) as User;
            if (!userData || !userData.comparePassword(password)) {
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

    async signup(userData: TSignupParams): Promise<{ token: string } | null> {
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

export default AuthenticationController;
