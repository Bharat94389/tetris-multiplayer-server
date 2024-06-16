import {
    DeleteOptions,
    DeleteResult,
    FindOptions,
    InsertOneOptions,
    UpdateOptions,
    UpdateResult,
} from 'mongodb';
import { IDatabase, TCollectionName } from '../database';

export abstract class BaseModel<T> {
    constructor(
        protected database: IDatabase,
        protected collectionName: TCollectionName,
        protected fnGetSchemaInstance: (data: any) => any
    ) {}

    async create(data: T, options: InsertOneOptions = {}): Promise<T> {
        const instance = this.fnGetSchemaInstance(data);
        await this.database.getCollection(this.collectionName).insertOne(instance, options);

        // delete _id as this should not be sent to the user
        delete instance['_id'];
        return instance;
    }

    async findOne(query: any, options: FindOptions = {}): Promise<T> {
        if (!options.projection) {
            options.projection = {};
        }
        options.projection._id = 0;

        return await this.database.getCollection(this.collectionName).findOne<T>(query, options);
    }

    async find(query: any, options: FindOptions = {}): Promise<T[]> {
        if (!options.projection) {
            options.projection = {};
        }
        options.projection._id = 0;

        return await this.database
            .getCollection(this.collectionName)
            .find<T>(query, options)
            .toArray();
    }

    async update(filter: any, data: T, options: UpdateOptions = {}): Promise<UpdateResult<T>> {
        // delete _id field as it is immutable
        delete data['_id'];
        return await this.database
            .getCollection(this.collectionName)
            .updateOne(filter, { $set: data }, options);
    }

    async delete(filter: any, options: DeleteOptions = {}): Promise<DeleteResult> {
        return await this.database.getCollection(this.collectionName).deleteOne(filter, options);
    }
}
