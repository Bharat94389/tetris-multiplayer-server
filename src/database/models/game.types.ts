type TStatus =
    (typeof import('../../constants').GAME_STATUS)[keyof typeof import('../../constants').GAME_STATUS];;

type TGameParams = {
    gameId?: string;
    owner: string;
    tSequence?: string;
    status?: TStatus;
    createdAt?: Date;
};

interface IGame {
    gameId: string;
    owner: string;
    tSequence: string;
    status: TStatus;
    createdAt: Date;
}

export { TGameParams, TStatus, IGame };
