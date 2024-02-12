import { Game } from "../database";

class GameController {
    async find({ owner }: {owner: string}) {
        return await Game.find({ owner });
    }
}

export { GameController };
