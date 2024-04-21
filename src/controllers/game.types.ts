import { IGame } from "../database/models/game.types";

type TCreateGameParams = {
    owner: string;
};

interface IGameController {
    createGame(param: TCreateGameParams): Promise<IGame>;
    find(query: Object): Promise<IGame[]>;
}

export { TCreateGameParams, IGameController };
