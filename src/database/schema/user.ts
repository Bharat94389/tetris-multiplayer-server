export default interface UserSchema {
    email: string;
    password: string;
    isVerified?: boolean;
}
