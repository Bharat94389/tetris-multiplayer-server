import { JWT } from '../utils';
import { TRequestInfo } from '../server.types';
import { UnauthorizedError, ValidationError } from '../errors';
import { UserModel } from '../database/models';

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
    constructor(private userModel: UserModel) {}

    async login(requestInfo: TRequestInfo) {
        const { email, password }: TLoginParams = requestInfo.body;
        const userData = await this.userModel.findOne({ email });
        // verify user details
        if (!userData || !this.userModel.comparePassword(password, userData.password)) {
            throw new UnauthorizedError('Invalid email or password');
        }

        // generate token
        const token = JWT.generate({
            username: userData.username,
            email: userData.email,
        });
        return { token };
    }

    async signup(requestInfo: TRequestInfo) {
        const userData: TSignupParams = requestInfo.body;

        // find the user with same username in database
        const userInDb = await this.userModel.findOne({ username: userData.username });
        if (userInDb) {
            throw new ValidationError('User with same username already exists', {
                email: userData.email,
            });
        }

        // if no user in database create user
        await this.userModel.create(userData);
    }
}
