import { Redis } from 'ioredis';
import { RedisAdapter, createAdapter } from '@socket.io/redis-adapter';
import { CACHE } from '../constants';
import { redisConfig } from '../config';
import { Logger } from './logger';

export interface IRedisClient {
    createSocketAdapter(): (nsp: any) => RedisAdapter;
    getGameCacheKey(gameId: string): string;
    getPlayerCacheKey(gameId: string, username: string): string;
    set<T>(key: string, data: T): Promise<void>;
    getOne<T>(key: string): Promise<T | null>;
    getMany<T>(pattern: string): Promise<T[]>;
    delete(pattern: string): Promise<void>;
}

export class RedisClient implements IRedisClient {
    private client: Redis;

    constructor(config: typeof redisConfig) {
        const client = new Redis(config);

        client.on('error', (err) => {
            Logger.info('error in redis: ', err);
        });

        this.client = client;
    }

    createSocketAdapter() {
        return createAdapter(this.client, this.client.duplicate());
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
