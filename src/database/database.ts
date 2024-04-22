import { MongoClient, Db, Collection, Document, FindOptions } from 'mongodb';
import { AppError, logger } from '../utils';
import { databaseConfig } from './../config';
import { COLLECTIONS } from '../constants';
import { Game, PlayerStats, User } from './models';
import { IGame } from './models/game.types';
import { IUser } from './models/user.types';
import { IPlayerStats } from './models/playerStats.types';
import { IDatabase, TCollectionName } from './database.types';

class Database implements IDatabase {
    readonly connectionUrl: string;
    readonly dbName: string;
    readonly options: any;
    db: Db | null;

    constructor({
        connectionUrl,
        options,
        dbName,
    }: {
        connectionUrl: string;
        options: any;
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

    getModelFromCollectionName(
        collectionName: TCollectionName,
        data: IGame | IUser | IPlayerStats
    ): IGame | IUser | IPlayerStats {
        if (collectionName === COLLECTIONS.GAME) {
            return new Game(data as IGame);
        }
        if (collectionName === COLLECTIONS.USER) {
            return new User(data as IUser);
        }
        return new PlayerStats(data as IPlayerStats);
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

    async findOne<T extends IGame | IUser | IPlayerStats>(
        collectionName: TCollectionName,
        query: any,
        options?: FindOptions<T>
    ): Promise<IGame | IUser | IPlayerStats | null> {
        try {
            const collection = this.getCollection(collectionName);
            const doc: T | null = await collection.findOne<T>(query, options);
            if (!doc) {
                return null;
            }
            return this.getModelFromCollectionName(collectionName, doc);
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

    async find<T extends IGame | IUser | IPlayerStats>(
        collectionName: TCollectionName,
        query: any,
        options?: FindOptions<T>
    ): Promise<(IGame | IUser | IPlayerStats)[]> {
        try {
            const collection = this.getCollection(collectionName);
            const result = await collection.find<T>(query, options).toArray();
            return result.map((doc) => this.getModelFromCollectionName(collectionName, doc));
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
