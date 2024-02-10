import { Document } from 'mongodb';

export default interface UserSchema extends Document {
    email: string;
    password: string;
    isVerified?: boolean;
}
