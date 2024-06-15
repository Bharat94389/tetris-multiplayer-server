import { Redis } from 'ioredis';
import { CACHE } from '../constants';
import { redisConfig } from 'config';

export interface IRedisClient {
    client: Redis;

    getGameCacheKey(gameId: string): string;
    getPlayerCacheKey(gameId: string, username: string): string;
    set<T>(key: string, data: T): Promise<void>;
    getOne<T>(key: string): Promise<T | null>;
    getMany<T>(pattern: string): Promise<T[]>;
}

export class RedisClient implements IRedisClient {
    client: Redis;

    constructor(config: typeof redisConfig) {
        this.client = new Redis(config);
    }

    getGameCacheKey(gameId: string) {
        return `${CACHE.GAME}:${gameId}`;
    }

    getPlayerCacheKey(gameId: string, username: string) {
        return `${CACHE.PLAYER}:${gameId}:${username}`;
    }

    async set<T>(key: string, data: T) {
        await this.client.set(key, JSON.stringify(data));
    }

    async getOne<T>(key: string): Promise<T | null> {
        const data = await this.client.get(key);
        if (!data) {
            return null;
        }
        return JSON.parse(data);
    }

    async getMany<T>(pattern: string): Promise<T[]> {
        const keys = await this.client.keys(pattern);
        const data = await this.client.mget(keys);
        return data.map((d) => JSON.parse(d || '')).filter((d) => d);
    }

    async delete(pattern: string) {
        await this.client.del(pattern);
    }
}
