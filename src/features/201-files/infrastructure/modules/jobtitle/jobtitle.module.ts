import { Module } from '@nestjs/common';
import { JobTitleController } from './controller/jobtitle.controller';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { CreateJobTitleUseCase } from '@features/201-files/application/use-cases/jobtitle/create-jobtitle.use-case';
import { UpdateJobTitleUseCase } from '@features/201-files/application/use-cases/jobtitle/update-jobtitle.use-case';
import { RetrieveJobTitleForComboboxUseCase } from '@features/201-files/application/use-cases/jobtitle/retrieve-jobtitle-for-combobox.use-case';
import { FindJobTitlePaginatedListUseCase } from '@features/201-files/application/use-cases/jobtitle/find-jobtitle-paginated-list.use-case';
import { SoftDeleteJobTitleUseCase } from '@features/201-files/application/use-cases/jobtitle/soft-delete-jobtitle.use-case';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { JobTitleRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/jobtitle.repository';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [JobTitleController],
  providers: [
    // Directly provide TransactionAdapter here
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.JOBTITLE,
      useClass: JobTitleRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    }, // Dependency Injection
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER,
      useClass: ErrorHandlerService,
    }, // Dependency Injection
    CreateJobTitleUseCase,
    UpdateJobTitleUseCase,
    SoftDeleteJobTitleUseCase,
    FindJobTitlePaginatedListUseCase,
    RetrieveJobTitleForComboboxUseCase,
  ],
  exports: [
    CreateJobTitleUseCase,
    UpdateJobTitleUseCase,
    SoftDeleteJobTitleUseCase,
    FindJobTitlePaginatedListUseCase,
    RetrieveJobTitleForComboboxUseCase,
  ],
})
export class JobTitleModule {}
