import { AuthenticationRouter, GameRouter } from '../routers';
import { IocContainer } from './iocContainer';
import { AuthenticationController } from '../controllers/authentication.controller';
import { Database } from '../database/database';
import { databaseConfig, redisConfig } from '../config';
import { GameController } from '../controllers/game.controller';
import { RedisClient } from '../utils/redisClient';

export enum ServicesEnum {
    database,
    authenticationRouter,
    authenticationController,
    gameRouter,
    gameController,
    redisClient,
    jwt,
}

export const createContainer = () => {
    const container = new IocContainer();

    // Database
    container.register(ServicesEnum.database, () => new Database(databaseConfig));

    // Routers
    container.register(
        ServicesEnum.authenticationRouter,
        (c: IocContainer) => new AuthenticationRouter(c[ServicesEnum.authenticationController])
    );

    container.register(
        ServicesEnum.gameRouter,
        (c: IocContainer) => new GameRouter(c[ServicesEnum.gameController])
    );

    // Controllers
    container.register(
        ServicesEnum.authenticationController,
        (c: IocContainer) =>
            new AuthenticationController(c[ServicesEnum.database])
    );

    container.register(
        ServicesEnum.gameController,
        (c: IocContainer) => new GameController(c[ServicesEnum.database])
    );

    // utils
    container.register(ServicesEnum.redisClient, () => new RedisClient(redisConfig));

    return container;
};
