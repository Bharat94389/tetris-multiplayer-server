import { MongoClient } from 'mongodb';
import { logger } from '../utils';

class Database {
    connectionUrl: string;
    dbName: string;
    options: Object;
    db: any;

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
    }

    async connectAsync() {
        const client = new MongoClient(this.connectionUrl, this.options);
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
