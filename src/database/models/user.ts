import bcrypt from 'bcrypt';
import { IUser, TUserParams } from './user.types';

export class User implements IUser {
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
