import { Redis } from 'ioredis';
import { redisConfig } from '../config';
import { CACHE } from '../constants';
import AppError from './appError';
import { IRedisClient } from './redisClient.types';

class RedisClient implements IRedisClient {
    client: Redis;

    constructor({ host, port, username, password }: any) {
        this.client = new Redis({ host, port, username, password });
    }

    getGameCacheKey(gameId: string) {
        return `${CACHE.GAME}:${gameId}`;
    }

    getPlayerCacheKey(gameId: string, username: string) {
        return `${CACHE.PLAYER}:${gameId}:${username}`;
    }

    async set<T>(key: string, data: T) {
        try {
            await this.client.set(key, JSON.stringify(data));
        } catch (err: any) {
            throw new AppError({ message: err.message, args: err.stack });
        }
    }

    async getOne<T>(key: string): Promise<T | null> {
        try {
            const data = await this.client.get(key);
            if (!data) {
                return null;
            }
            return JSON.parse(data);
        } catch (err: any) {
            throw new AppError({ message: err.message, args: err.stack });
        }
    }

    async getMany<T>(pattern: string): Promise<T[]> {
        try {
            const keys = await this.client.keys(pattern);
            const data = await this.client.mget(keys);
            return data.map((d) => JSON.parse(d || '')).filter((d) => d);
        } catch (err: any) {
            throw new AppError({ message: err.message, args: err.stack });
        }
    }
}

export default new RedisClient(redisConfig);
