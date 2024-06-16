import { IDatabase } from '../database';
import { BaseModel } from './base.model';
import { COLLECTIONS } from '../../constants';
import { IGame } from '../schema';
import { Game } from '../schema/game.schema';

export class GameModel extends BaseModel<IGame> {
    constructor(database: IDatabase) {
        super(database, COLLECTIONS.GAME, (data) => new Game(data));
    }
}
