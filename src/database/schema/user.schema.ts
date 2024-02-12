import bcrypt from 'bcrypt';

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
        this.email = userData.email;
        this.password = this.generateHash(userData.password);
        this.isVerified = Boolean(userData.isVerified);
        this.createdAt = userData.createdAt || new Date();
        if (userData.meta) {
            this.meta = {
                versionId: userData.meta.versionId + 1,
                lastUpdated: new Date(),
            };
        } else {
            this.meta = {
                versionId: 1,
                lastUpdated: new Date(),
            };
        }
    }

    private generateHash(password: string): string {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
    }
}

export { UserData, UserSchema };
