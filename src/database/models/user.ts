import bcrypt from 'bcrypt';
import { validate } from 'email-validator';
import { AppError } from '../../utils';
import { IUser, TUserParams } from './user.types';

class User implements IUser {
    username: string;
    email: string;
    password: string;
    isVerified: boolean;
    createdAt: Date;
    meta: {
        versionId: number;
        lastUpdated: Date;
    };

    constructor(userData: TUserParams) {
        this.username = userData.username;
        if (!validate(userData.email)) {
            throw new AppError({ message: 'Invalid Email', status: 400 });
        }
        this.email = userData.email;
        this.password = userData.password;
        this.isVerified = Boolean(userData.isVerified);
        this.createdAt = userData.createdAt || new Date();
        this.meta = {
            versionId: 1,
            lastUpdated: new Date(),
        };
        if (userData.meta) {
            this.meta.versionId = userData.meta.versionId + 1;
        }
    }

    encryptPassword() {
        this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(8));
    }

    comparePassword(password: string): boolean {
        return bcrypt.compareSync(password, this.password);
    }
}

export { User };
