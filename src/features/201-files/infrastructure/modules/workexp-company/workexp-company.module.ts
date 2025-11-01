import { Module } from '@nestjs/common';
import { WorkExpCompanyController } from './controller/workexp-company.controller';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { CreateWorkExpCompanyUseCase } from '@features/201-files/application/use-cases/workexp-company/create-workexp-company.use-case';
import { UpdateWorkExpCompanyUseCase } from '@features/201-files/application/use-cases/workexp-company/update-workexp-company.use-case';
import { RetrieveWorkExpCompanyForComboboxUseCase } from '@features/201-files/application/use-cases/workexp-company/retrieve-workexp-company-for-combobox.use-case';
import { FindWorkExpCompanyPaginatedListUseCase } from '@features/201-files/application/use-cases/workexp-company/find-workexp-company-paginated-list.use-case';
import { SoftDeleteWorkExpCompanyUseCase } from '@features/201-files/application/use-cases/workexp-company/soft-delete-workexp-company.use-case';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { WorkexpCompanyRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/workexp-company.repository';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [WorkExpCompanyController],
  providers: [
    // Directly provide TransactionAdapter here
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.WORKEXPCOMPANY,
      useClass: WorkexpCompanyRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    }, // Dependency Injection
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER,
      useClass: ErrorHandlerService,
    }, // Dependency Injection
    CreateWorkExpCompanyUseCase,
    UpdateWorkExpCompanyUseCase,
    SoftDeleteWorkExpCompanyUseCase,
    FindWorkExpCompanyPaginatedListUseCase,
    RetrieveWorkExpCompanyForComboboxUseCase,
  ],
  exports: [
    CreateWorkExpCompanyUseCase,
    UpdateWorkExpCompanyUseCase,
    SoftDeleteWorkExpCompanyUseCase,
    FindWorkExpCompanyPaginatedListUseCase,
    RetrieveWorkExpCompanyForComboboxUseCase,
  ],
})
export class WorkExpCompanyModule {}
