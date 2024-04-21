import { Redis } from 'ioredis';

interface IRedisClient {
    client: Redis;

    getGameCacheKey(gameId: string): string;
    getPlayerCacheKey(gameId: string, username: string): string;
    set<T>(key: string, data: T): Promise<void>;
    getOne<T>(key: string): Promise<T | null>;
    getMany<T>(pattern: string): Promise<T[]>;
}

export { IRedisClient };
