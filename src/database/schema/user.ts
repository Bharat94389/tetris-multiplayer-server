export default interface UserSchema {
    email: string;
    username: string;
    password: string;
    isVerified?: boolean;
}
