import {
  TransactionPort,
  TransactionOptions,
  IsolationLevel,
} from 'src/features/shared/ports/transaction-port';
import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class TransactionAdapter implements TransactionPort {
  constructor(private readonly dataSource: DataSource) {}

  async executeTransaction<T>(
    actionlog: string,
    operation: (manager: EntityManager) => Promise<T>,
    options: TransactionOptions = {},
  ): Promise<T> {
    const { isolationLevel = IsolationLevel.READ_COMMITTED } = options;
    const logger = new Logger(actionlog);
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction(isolationLevel);
      logger.debug(
        `Starting transaction with isolation level: ${isolationLevel}`,
      );

      const result = await operation(queryRunner.manager);
      await queryRunner.commitTransaction();

      logger.debug('Transaction committed successfully');
      return result;
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      logger.error('Transaction rolled back', error.message);

      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
