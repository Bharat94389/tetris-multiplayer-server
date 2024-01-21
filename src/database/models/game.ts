import BaseModel from './baseModel';
import { GameSchema } from '../schema';

class Game extends BaseModel {
    data: GameSchema | undefined;

    constructor({ data }: { data?: GameSchema }) {
        super(constants.COLLECTIONS.GAME);

        this.data = data;
    }

    async create(): Promise<boolean> {
        const collection = await this.getCollection();
        if (this.data) {
            await collection.insertOne(this.data);
            return true;
        }
        return false;
    }
}
