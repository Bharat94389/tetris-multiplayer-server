const { MongoClient } = require('mongodb');
const { logger } = require('./utils');

class Database {
    constructor({ connectionUrl, databaseOptions, databaseName }) {
        this.connectionUrl = connectionUrl;
        this.databaseName = databaseName;
        this.databaseOptions = databaseOptions;
    }

    async connectAsync() {
        const client = new MongoClient(this.connectionUrl, this.databaseOptions);
        try {
            logger.info({ message: 'Connecting to client...' });
            await client.connect();
            this.db = client.db(this.databaseName);
            logger.info({ message: 'Connected to client...' });
        } catch (err) {
            client.close();
            logger.info({ message: 'Closing connection to client...' });
            throw err;
        }
    }

    insert(collection, doc) {
        this.db.collection(collection).insertOne(doc);
    }
}

module.exports = Database;
