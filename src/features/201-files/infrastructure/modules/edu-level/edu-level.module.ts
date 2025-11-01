import { Module } from '@nestjs/common';
import { EduLevelController } from './controller/edu-level.controller';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { CreateEduLevelUseCase } from '@features/201-files/application/use-cases/edu-level/create-edu-level.use-case';
import { UpdateEduLevelUseCase } from '@features/201-files/application/use-cases/edu-level/update-edu-level.use-case';
import { RetrieveEduLevelForComboboxUseCase } from '@features/201-files/application/use-cases/edu-level/retrieve-edu-level-for-combobox.use-case';
import { FindEduLevelPaginatedListUseCase } from '@features/201-files/application/use-cases/edu-level/find-edu-level-paginated-list.use-case';
import { SoftDeleteEduLevelUseCase } from '@features/201-files/application/use-cases/edu-level/soft-delete-edu-level.use-case';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { EduLevelRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/edu-level.repository';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [EduLevelController],
  providers: [
    // Directly provide TransactionAdapter here
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.EDULEVEL,
      useClass: EduLevelRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    }, // Dependency Injection
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER,
      useClass: ErrorHandlerService,
    }, // Dependency Injection
    CreateEduLevelUseCase,
    UpdateEduLevelUseCase,
    SoftDeleteEduLevelUseCase,
    FindEduLevelPaginatedListUseCase,
    RetrieveEduLevelForComboboxUseCase,
  ],
  exports: [
    CreateEduLevelUseCase,
    UpdateEduLevelUseCase,
    SoftDeleteEduLevelUseCase,
    FindEduLevelPaginatedListUseCase,
    RetrieveEduLevelForComboboxUseCase,
  ],
})
export class EduLevelModule {}
