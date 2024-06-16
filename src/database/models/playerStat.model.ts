import { IDatabase } from '../database';
import { BaseModel } from './base.model';
import { COLLECTIONS } from '../../constants';
import { IPlayerStat } from '../schema';
import { PlayerStat } from '../schema/playerStat.schema';

export class PlayerStatModel extends BaseModel<IPlayerStat> {
    constructor(database: IDatabase) {
        super(database, COLLECTIONS.PLAYER_STATS, (data) => new PlayerStat(data));
    }
}
