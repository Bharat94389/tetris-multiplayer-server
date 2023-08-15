const { MongoClient } = require('mongodb');

class Database {
    constructor({ connectionUrl, databaseOptions, databaseName }) {
        this.connectionUrl = connectionUrl;
        this.databaseName = databaseName;
        this.databaseOptions = databaseOptions;
    }

    async connectAsync() {
        const client = new MongoClient(this.connectionUrl, this.databaseOptions);
        try {
            console.log('Connecting to client...');
            await client.connect();
            this.db = client.db(this.databaseName);
            console.log('Connected to client...');
        } catch (err) {
            throw err;
        } finally {
            client.close();
        }
    }
}

module.exports = Database;
