import { MongoClient, Db, Collection } from 'mongodb';
import { Logger } from '../utils';
import { COLLECTIONS } from '../constants';
import { databaseConfig } from '../config';
import { OperationalError } from '../errors/operational.error';

export type TCollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

export interface IDatabase {
    db: import('mongodb').Db | null;

    connectAsync(): Promise<void>;
    getCollection(collectionName: TCollectionName): Collection;
}

export class Database implements IDatabase {
    db: Db | null;

    constructor(private config: typeof databaseConfig) {}

    async connectAsync(): Promise<void> {
        const client: MongoClient = new MongoClient(this.config.connectionUrl, this.config.options);
        try {
            Logger.info('Connecting to client...');
            await client.connect();
            this.db = client.db(this.config.dbName);
            Logger.info('Connected to client...');
        } catch (err) {
            await client.close();
            Logger.info('Closing connection to client...');
            throw err;
        }
    }

    getCollection(collectionName: TCollectionName): Collection {
        if (this.db) {
            return this.db.collection(collectionName);
        } else {
            throw new OperationalError(
                'Initialize the database before calling getCollection method'
            );
        }
    }
}
