import { User } from '../database/models';
import { JWT } from '../utils';
import { COLLECTIONS } from '../constants';
import { IUser } from '../database/models/user.types';
import { TRequestInfo } from '../server.types';
import { UnauthorizedError, ValidationError } from '../errors';
import { IDatabase } from 'database';

type TLoginParams = {
    email: string;
    password: string;
};

type TSignupParams = {
    username: string;
    email: string;
    password: string;
};

export interface IAuthenticationController {
    login(requestInfo: TRequestInfo): Promise<{ token: string } | null>;
    signup(requestInfo: TRequestInfo): Promise<void>;
}

export class AuthenticationController implements IAuthenticationController {
    constructor(private database: IDatabase) {}

    async login(requestInfo: TRequestInfo) {
        const { email, password }: TLoginParams = requestInfo.body;
        const userData = (await this.database.findOne<IUser>(COLLECTIONS.USER, {
            email,
        })) as User;
        if (!userData || !userData.comparePassword(password)) {
            throw new UnauthorizedError('Invalid email or password');
        }
        const token = JWT.generate({
            username: userData.username,
            email: userData.email,
        });
        return { token };
    }

    async signup(requestInfo: TRequestInfo) {
        const userData: TSignupParams = requestInfo.body;

        // find the user with same email in database
        const userInDb = await this.database.findOne(COLLECTIONS.USER, { email: userData.email });
        if (userInDb) {
            throw new ValidationError('User with same email already exists', { email: userData.email });
        }

        // if no user in database create user
        const user = new User(userData);
        user.encryptPassword();
        await this.database.create(COLLECTIONS.USER, user);
    }
}
