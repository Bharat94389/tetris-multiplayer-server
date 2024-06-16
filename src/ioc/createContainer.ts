import { AuthenticationRouter, GameRouter } from '../routers';
import { IocContainer } from './iocContainer';
import { AuthenticationController } from '../controllers/authentication.controller';
import { Database } from '../database/database';
import { databaseConfig, redisConfig } from '../config';
import { GameController } from '../controllers/game.controller';
import { RedisClient } from '../utils/redisClient';
import { GameModel, PlayerStatModel, UserModel } from '../database/models';

export enum ServicesEnum {
    database,
    userModel,
    gameModel,
    playerStatModel,
    authenticationRouter,
    gameRouter,
    authenticationController,
    gameController,
    socket,
    redisClient,
    jwt,
}

export const createContainer = () => {
    const container = new IocContainer();

    // Database
    container.register(ServicesEnum.database, () => new Database(databaseConfig));

    container.register(
        ServicesEnum.userModel,
        (c: IocContainer) => new UserModel(c[ServicesEnum.database])
    );

    container.register(
        ServicesEnum.gameModel,
        (c: IocContainer) => new GameModel(c[ServicesEnum.database])
    );

    container.register(
        ServicesEnum.playerStatModel,
        (c: IocContainer) => new PlayerStatModel(c[ServicesEnum.database])
    );

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
            new AuthenticationController(c[ServicesEnum.userModel])
    );

    container.register(
        ServicesEnum.gameController,
        (c: IocContainer) => new GameController(c[ServicesEnum.gameModel])
    );

    // socket

    // utils
    container.register(ServicesEnum.redisClient, () => new RedisClient(redisConfig));

    return container;
};
