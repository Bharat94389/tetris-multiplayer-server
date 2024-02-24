import { Redis } from 'ioredis';
import { redisConfig } from '../config';
import { CACHE } from '../constants';

class RedisClient {
    client: Redis;

    constructor({ host, port, password }: any) {
        this.client = new Redis({ host, port, password });
    }

    getGameCacheKey(gameId: string) {
        return `${CACHE.GAME}:${gameId}`;
    }

    getPlayerCacheKey(gameId: string, username: string) {
        return `${CACHE.PLAYER}:${gameId}:${username}`;
    }

    async set(key: string, data: any) {
        await this.client.set(key, JSON.stringify(data));
    }

    async getOne(key: string) {
        const data = await this.client.get(key);
        if (!data) {
            return null;
        }
        return JSON.parse(data);
    }

    async getMany(pattern: string) {
        const keys = await this.client.keys(pattern);
        const data = await this.client.mget(keys);
        return data.map(d => JSON.parse(d || ''));
    }
}

export default new RedisClient(redisConfig);
