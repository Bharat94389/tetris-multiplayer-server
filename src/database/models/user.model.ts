import bcrypt from 'bcrypt';
import { FindOptions } from 'mongodb';
import database from '../database';
import BaseModel from './base.model';
import { UserSchema, UserData } from '../schema';
import { AppError, logger } from '../../utils';
import { COLLECTIONS } from '../../constants';

class User extends BaseModel {
    data?: UserData;

    async authenticate(): Promise<boolean> {
        if (!this.data || !this.data.email || !this.data.password) {
            return false;
        }
        const userCollection = database.getCollection<UserSchema>(COLLECTIONS.USER);
        const userData = await userCollection.findOne({ email: this.data.email });
        if (!userData || bcrypt.compareSync(this.data.password, userData.password)) {
            return false;
        }
        return true;
    }

    static async find(filter: any, options?: FindOptions<UserSchema>) {
        const userCollection = database.getCollection<UserSchema>(COLLECTIONS.USER);
        const usersData = await userCollection.find(filter, options).toArray();
        return usersData.map((userData) => new UserSchema(userData));
    }

    static async findOne(
        filter: any,
        options?: FindOptions<UserSchema>
    ): Promise<UserSchema | null> {
        const userCollection = database.getCollection<UserSchema>(COLLECTIONS.USER);
        const userData = await userCollection.findOne(filter, options);
        if (!userData) {
            return null;
        }
        return new UserSchema(userData);
    }

    async create() {
        if (this.data) {
            const userCollection = database.getCollection<UserSchema>(COLLECTIONS.USER);
            const users = await userCollection.findOne({ email: this.data.email });

            if (!users) {
                const user = new UserSchema(this.data);
                await userCollection.insertOne(user);
                logger.info(`User with email ${this.data.email} created`);
            } else {
                throw new AppError({
                    message: 'User with this email already exists',
                    status: 400,
                });
            }
        } else {
            throw new AppError({
                message: 'Invalid User Data',
                status: 400,
            });
        }
    }
}

export default User;
