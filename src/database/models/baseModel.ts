import { Db } from 'mongodb';
import { AppError } from '../../utils';
import database from '../../database';

class BaseModel {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    async getCollection() {
        if (!database.db) {
            throw new AppError({ message: 'Initialize database instance before using models' });
        }
        const db: Db = database.db;
        if (!database.collections.includes(this.name)) {
            const collectionNames: string[] = (await db.listCollections().toArray()).map(
                (c) => c.name
            );

            database.collections = collectionNames;
            if (!collectionNames.includes(this.name)) {
                // add validators or implement validations on the server
                await db.createCollection(this.name);
                database.collections.push(this.name);
            }
        }
        return database.db.collection(this.name);
    }

    validate(): void {
        throw new AppError({ message: 'Validate is not implemented' });
    }

    async get(filter: { username?: string; email?: string; password?: string }): Promise<any> {
        const collection = await this.getCollection();
        return await collection.findOne(filter);
    }

    async create(): Promise<boolean> {
        throw new AppError({ message: 'Create is not implemented' });
    }

    async update(filter: any, data: any): Promise<void> {
        throw new AppError({ message: 'Update is not implemented' });
    }

    async delete(): Promise<void> {
        throw new AppError({ message: 'Delete is not implemented' });
    }
}

export default BaseModel;
