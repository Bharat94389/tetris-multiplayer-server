import { Collection, FindOptions } from 'mongodb';
import { COLLECTIONS } from '../constants';
import { IGame } from './models/game.types';
import { IUser } from './models/user.types';
import { IPlayerStats } from './models/playerStats.types';

type TCollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

interface IDatabase {
    readonly connectionUrl: string;
    readonly dbName: string;
    readonly options: Object;
    db: import('mongodb').Db | null;

    connectAsync(): Promise<void>;
    getCollection<T extends Document>(collectionName: TCollectionName): Collection<T>;
    getModelFromCollectionName(
        collectionName: TCollectionName,
        data: IGame | IUser | IPlayerStats
    ): IGame | IUser | IPlayerStats;
    create<T extends Document>(collectionName: TCollectionName, document: T): Promise<void>;
    findOne<T extends IGame | IUser | IPlayerStats>(
        collectionName: TCollectionName,
        query: Object,
        options?: FindOptions<T>
    ): Promise<IGame | IUser | IPlayerStats | null>;
    find<T extends IGame | IUser | IPlayerStats>(
        collectionName: TCollectionName,
        query: Object,
        options?: FindOptions<T>
    ): Promise<(IGame | IUser | IPlayerStats)[]>;
}

export { TCollectionName, IDatabase };