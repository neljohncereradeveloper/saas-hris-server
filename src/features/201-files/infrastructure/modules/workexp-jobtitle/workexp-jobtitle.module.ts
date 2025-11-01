import { Module } from '@nestjs/common';
import { WorkExpJobTitleController } from './controller/workexp-jobtitle.controller';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { CreateWorkExpJobTitleUseCase } from '@features/201-files/application/use-cases/workexp-jobtitle/create-workexp-jobtitle.use-case';
import { UpdateWorkExpJobTitleUseCase } from '@features/201-files/application/use-cases/workexp-jobtitle/update-workexp-jobtitle.use-case';
import { RetrieveWorkExpJobTitleForComboboxUseCase } from '@features/201-files/application/use-cases/workexp-jobtitle/retrieve-workexp-jobtitle-for-combobox.use-case';
import { FindWorkExpJobTitlePaginatedListUseCase } from '@features/201-files/application/use-cases/workexp-jobtitle/find-workexp-jobtitle-paginated-list.use-case';
import { SoftDeleteWorkExpJobTitleUseCase } from '@features/201-files/application/use-cases/workexp-jobtitle/soft-delete-workexp-jobtitle.use-case';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { WorkExpJobTitleRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/workexp-jobtitle.repository';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [WorkExpJobTitleController],
  providers: [
    // Directly provide TransactionAdapter here
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.WORKEXPJOBTITLE,
      useClass: WorkExpJobTitleRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    }, // Dependency Injection
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER,
      useClass: ErrorHandlerService,
    }, // Dependency Injection
    CreateWorkExpJobTitleUseCase,
    UpdateWorkExpJobTitleUseCase,
    SoftDeleteWorkExpJobTitleUseCase,
    FindWorkExpJobTitlePaginatedListUseCase,
    RetrieveWorkExpJobTitleForComboboxUseCase,
  ],
  exports: [
    CreateWorkExpJobTitleUseCase,
    UpdateWorkExpJobTitleUseCase,
    SoftDeleteWorkExpJobTitleUseCase,
    FindWorkExpJobTitlePaginatedListUseCase,
    RetrieveWorkExpJobTitleForComboboxUseCase,
  ],
})
export class WorkExpJobTitleModule {}
