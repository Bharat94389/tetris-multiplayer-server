import { Redis } from 'ioredis';
import { redisConfig } from '../config';
import { CACHE } from '../constants';
import AppError from './appError';

class RedisClient {
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

    async set(key: string, data: any) {
        try {
            await this.client.set(key, JSON.stringify(data));
        } catch (err: any) {
            throw new AppError({ message: err.message, args: err.stack });
        }
    }

    async getOne(key: string) {
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

    async getMany(pattern: string) {
        try {
            const keys = await this.client.keys(pattern);
            const data = await this.client.mget(keys);
            return data.map((d) => JSON.parse(d || ''));
        } catch (err: any) {
            throw new AppError({ message: err.message, args: err.stack });
        }
    }
}

export default new RedisClient(redisConfig);
