'use strict';

import logger from '../utils/logger';
import { PrismaClient } from '.prisma/client';

class Database {
  private async connect(context: PrismaClient) {
    await context.$connect();
    logger.info('[loading...] database connection successfully established');
  }

  public async initializeDatabase(context: PrismaClient) {
    try {
      await this.connect(context);

      logger.info('[loading...] database init finished successfully');
    } catch (error) {
      logger.fatal('database init failed');
      logger.error(error);
      process.exit(1);
    }
  }
}

export default Database;