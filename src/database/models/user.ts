import constants from '../../constants';
import { logger } from '../../utils';
import { UserSchema } from '../schema';
import BaseModel from './baseModel';

class User extends BaseModel {
    data: UserSchema | undefined;

    constructor({ data }: { data?: UserSchema }) {
        super(constants.COLLECTIONS.USER);

        this.data = data;
    }

    async create(): Promise<boolean> {
        const collection = await this.getCollection();
        if (this.data) {
            const users = await collection.find({ email: this.data.email }).toArray();

            if (users.length === 0) {
                this.data.isVerified = false;
                await collection.insertOne(this.data);
                logger.info(`User with email ${this.data.email} created`);
                return true;
            }
        }
        return false;
    }

    async update(email: string, data: Object): Promise<void> {
        const collection = await this.getCollection();
        await collection.updateOne({ email }, { $set: data });
    }
}

export default User;
