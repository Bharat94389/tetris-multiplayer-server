import { MongoClient, Db } from 'mongodb';
import { logger } from '../utils';

class Database {
    connectionUrl: string;
    collections: string[];
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
        this.collections = [];
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
}

export default Database;
