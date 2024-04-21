import { IPlayerStats } from "../database/models/playerStats.types";

type TUserData = {
    email: string;
    username: string;
}

interface IPlayerStats1 extends IPlayerStats {
    active: boolean;
}

export { TUserData, IPlayerStats1 };
