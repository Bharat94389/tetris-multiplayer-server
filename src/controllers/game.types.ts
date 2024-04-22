import { IGame } from '../database/models/game.types';

type TCreateGameParams = {
    owner: string;
};

interface IGameController {
    createGame(param: TCreateGameParams): Promise<IGame>;
    find(query: any): Promise<IGame[]>;
}

export { TCreateGameParams, IGameController };
