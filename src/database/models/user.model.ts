import bcrypt from 'bcrypt';
import { Collection, FindOptions, WithId } from 'mongodb';
import { logger } from '../../utils';
import { UserSchema } from '../schema';
import database from '../database';
import { COLLECTIONS } from '../../constants';

class User {
    data: UserSchema | undefined;

    constructor(data?: UserSchema) {
        this.data = data;
    }

    private generateHash(password: string): string {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
    }

    validatePassword(password: string): boolean {
        return bcrypt.compareSync(password, this.data?.password || '');
    }

    static find(filter: any, options?: FindOptions<UserSchema>) {
        const userCollection = database.getCollection<UserSchema>(COLLECTIONS.USER);
        return userCollection.find(filter, options);
    }

    static async findOne(
        filter: any,
        options?: FindOptions<UserSchema>
    ): Promise<WithId<UserSchema> | null> {
        const userCollection = database.getCollection<UserSchema>(COLLECTIONS.USER);
        return await userCollection.findOne(filter, options);
    }

    async create(): Promise<boolean> {
        if (this.data) {
            const userCollection = database.getCollection<UserSchema>(COLLECTIONS.USER);
            const users = await userCollection.find({ email: this.data.email }).toArray();

            if (users.length === 0) {
                this.data.isVerified = false;
                this.data.password = this.generateHash(this.data.password);
                await userCollection.insertOne(this.data);
                logger.info(`User with email ${this.data.email} created`);
                return true;
            }
        }
        return false;
    }

    async update(email: string, data: Object): Promise<void> {
        const userCollection = database.getCollection<UserSchema>(COLLECTIONS.USER);
        await userCollection.updateOne({ email }, { $set: data });
    }
}

export default User;
