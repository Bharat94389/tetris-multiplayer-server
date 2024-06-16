import bcrypt from 'bcrypt';
import { IDatabase } from '../database';
import { BaseModel } from './base.model';
import { COLLECTIONS } from '../../constants';
import { IUser } from '../schema';
import { User } from '../schema/user.schema';
import { InsertOneOptions } from 'mongodb';

export class UserModel extends BaseModel<IUser> {
    constructor(database: IDatabase) {
        super(database, COLLECTIONS.USER, (data) => new User(data));
    }

    async create(data: IUser, options?: InsertOneOptions): Promise<IUser> {
        // encrypt password before storing to database
        data.password = this.encryptPassword(data.password);
        return super.create(data, options);
    }

    encryptPassword(password: string) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
    }

    comparePassword(password: string, hash: string) {
        return bcrypt.compareSync(password, hash);
    }
}
