const redisConfig = {
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || '6379',
    password: process.env.REDIS_PASSWORD || '',
    username: process.env.REDIS_USERNAME || '',
};

export default redisConfig;
