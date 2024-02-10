import { MongoClient, Db, Collection, Document } from 'mongodb';
import { AppError, logger } from '../utils';
import { databaseConfig } from './../config';

class Database {
    connectionUrl: string;
    dbName: string;
    options: Object;
    db: Db | null;

    constructor({
        connectionUrl,
        options,
        dbName,
    }: {
        connectionUrl: string;
        options: Object;
        dbName: string;
    }) {
        this.connectionUrl = connectionUrl;
        this.dbName = dbName;
        this.options = options;
        this.db = null;
    }

    async connectAsync(): Promise<void> {
        const client: MongoClient = new MongoClient(this.connectionUrl, this.options);
        try {
            logger.info('Connecting to client...');
            await client.connect();
            this.db = client.db(this.dbName);
            logger.info('Connected to client...');
        } catch (err) {
            await client.close();
            logger.info('Closing connection to client...');
            throw err;
        }
    }

    getCollection<T extends Document>(collectionName: string): Collection<T> {
        if (this.db) {
            return this.db.collection(collectionName);
        } else {
            throw new AppError({ message: 'Initialize the database before accessing db' });
        }
    }
}

export default new Database({
    connectionUrl: databaseConfig.connectionUrl,
    options: databaseConfig.options,
    dbName: databaseConfig.dbName,
});

export { Database };
