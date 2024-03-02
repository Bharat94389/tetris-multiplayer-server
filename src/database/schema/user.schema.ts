import bcrypt from 'bcrypt';
import { validate } from 'email-validator';
import { AppError } from '../../utils';

interface UserData {
    username: string;
    email: string;
    password: string;
    isVerified?: boolean;
    createdAt?: Date;
    meta?: {
        versionId: number;
        lastUpdated: Date;
    };
}

class UserSchema implements UserData {
    username: string;
    email: string;
    password: string;
    isVerified: boolean;
    createdAt: Date;
    meta: {
        versionId: number;
        lastUpdated: Date;
    };

    constructor(userData: UserData) {
        this.username = userData.username;
        if (!validate(userData.email)) {
            throw new AppError({ message: 'Invalid Email', status: 400 });
        }
        this.email = userData.email;
        this.password = this.generateHash(userData.password);
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

    private generateHash(password: string): string {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
    }
}

export { UserData, UserSchema };
