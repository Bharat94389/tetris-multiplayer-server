import BaseModel from './base.model';
import database from '../database';
import { PlayerStatsData, PlayerStatsSchema } from '../schema';
import { COLLECTIONS } from '../../constants';
import { AppError, logger } from '../../utils';

class PlayerStats extends BaseModel {
    data?: PlayerStatsData;

    async create() {
        if (this.data) {
            const statsCollection = database.getCollection<PlayerStatsSchema>(COLLECTIONS.PLAYER_STATS);
            const stats = new PlayerStatsSchema(this.data);
            await statsCollection.insertOne(stats);
            logger.info(`Stats for user ${stats.username} for gameId ${stats.gameId} added to database`);
        } else {
            throw new AppError({
                message: 'Invalid Stats Data',
                status: 400,
            });
        }
    }
}

export default PlayerStats;
