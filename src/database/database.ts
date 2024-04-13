import { MongoClient, Db, Collection, Document, FindOptions } from 'mongodb';
import { AppError, logger } from '../utils';
import { databaseConfig } from './../config';
import { COLLECTIONS } from '../constants';
import { Game, PlayerStats, TGame, TPlayerStats, TUser, User } from './models';

type TCollectionName =
    | typeof COLLECTIONS.USER
    | typeof COLLECTIONS.GAME
    | typeof COLLECTIONS.PLAYER_STATS;

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

    getCollection<T extends Document>(collectionName: TCollectionName): Collection<T> {
        if (this.db) {
            return this.db.collection<T>(collectionName);
        } else {
            throw new AppError({ message: 'Initialize the database before accessing db' });
        }
    }

    getModelFromCollectioName(collectionName: TCollectionName, data: TGame | TUser | TPlayerStats) {
        if (collectionName === COLLECTIONS.GAME) {
            return new Game(data as TGame);
        }
        if (collectionName === COLLECTIONS.USER) {
            return new User(data as TUser);
        }
        if (collectionName === COLLECTIONS.PLAYER_STATS) {
            return new PlayerStats(data as TPlayerStats);
        }
    }

    async create<T extends Document>(collectionName: TCollectionName, document: T) {
        try {
            const collection = this.getCollection(collectionName);
            await collection.insertOne(document);
        } catch (err: any) {
            throw new AppError({
                message: err.message,
                args: {
                    collectionName,
                    stack: err.stack,
                },
            });
        }
    }

    async findOne<T extends TGame | TUser | TPlayerStats>(
        collectionName: TCollectionName,
        query: Object,
        options?: FindOptions<T>
    ) {
        try {
            const collection = this.getCollection(collectionName);
            const doc = await collection.findOne<T>(query, options);
            if (!doc) {
                return null;
            }
            return this.getModelFromCollectioName(collectionName, doc);
        } catch (err: any) {
            throw new AppError({
                message: err.message,
                args: {
                    collectionName,
                    query,
                    options,
                    stack: err.stack,
                },
            });
        }
    }

    async find<T extends TGame | TUser | TPlayerStats>(
        collectionName: TCollectionName,
        query: Object,
        options?: FindOptions<T>
    ) {
        try {
            const collection = this.getCollection(collectionName);
            const result = await collection.find<T>(query, options).toArray();
            return result.map((doc) => this.getModelFromCollectioName(collectionName, doc));
        } catch (err: any) {
            throw new AppError({
                message: err.message,
                args: {
                    collectionName,
                    query,
                    options,
                    stack: err.stack,
                },
            });
        }
    }
}

export default new Database({
    connectionUrl: databaseConfig.connectionUrl,
    options: databaseConfig.options,
    dbName: databaseConfig.dbName,
});

export { Database };
