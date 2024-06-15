import { MongoClient, Db, Collection, Document, FindOptions } from 'mongodb';
import { Logger } from '../utils';
import { COLLECTIONS } from '../constants';
import { Game, PlayerStats, User } from './models';
import { IGame } from './models/game.types';
import { IUser } from './models/user.types';
import { IPlayerStats } from './models/playerStats.types';
import { IDatabase, TCollectionName } from './database.types';
import { databaseConfig } from '../config';

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

    getCollection<T extends Document>(collectionName: TCollectionName): Collection<T> {
        if (this.db) {
            return this.db.collection<T>(collectionName);
        } else {
            // throw new AppError({ message: 'Initialize the database before accessing db' });
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
        const collection = this.getCollection(collectionName);
        await collection.insertOne(document);
    }

    async findOne<T extends IGame | IUser | IPlayerStats>(
        collectionName: TCollectionName,
        query: any,
        options?: FindOptions<T>
    ): Promise<IGame | IUser | IPlayerStats | null> {
        const collection = this.getCollection(collectionName);
        const doc: T | null = await collection.findOne<T>(query, options);
        if (!doc) {
            return null;
        }
        return this.getModelFromCollectionName(collectionName, doc);
    }

    async find<T extends IGame | IUser | IPlayerStats>(
        collectionName: TCollectionName,
        query: any,
        options?: FindOptions<T>
    ): Promise<(IGame | IUser | IPlayerStats)[]> {
        const collection = this.getCollection(collectionName);
        const result = await collection.find<T>(query, options).toArray();
        return result.map((doc) => this.getModelFromCollectionName(collectionName, doc));
    }
}
