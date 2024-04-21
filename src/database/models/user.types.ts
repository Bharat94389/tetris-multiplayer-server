type TUserParams = {
    username: string;
    email: string;
    password: string;
    isVerified?: boolean;
    createdAt?: Date;
    meta?: {
        versionId: number;
        lastUpdated: Date;
    };
};

interface IUser {
    username: string;
    email: string;
    password: string;
    isVerified: boolean;
    createdAt: Date;
    meta: {
        versionId: number;
        lastUpdated: Date;
    };

    encryptPassword(): void;
    comparePassword(password: string): boolean;
}

export { IUser, TUserParams };
