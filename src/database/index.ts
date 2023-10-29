import Database from './database';
import { databaseConfig } from './../config';

import { User } from './models';

export default new Database({
    connectionUrl: databaseConfig.connectionUrl,
    options: databaseConfig.options,
    dbName: databaseConfig.dbName,
});

export { Database, User };
