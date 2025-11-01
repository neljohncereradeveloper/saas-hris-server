import { Module } from '@nestjs/common';
import { EmpStatusController } from './controller/empstatus.controller';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { CreateEmpStatusUseCase } from '@features/201-files/application/use-cases/empstatus/create-empstatus.use-case';
import { UpdateEmpStatusUseCase } from '@features/201-files/application/use-cases/empstatus/update-empstatus.use-case';
import { RetrieveEmpStatusForComboboxUseCase } from '@features/201-files/application/use-cases/empstatus/retrieve-empstatus-for-combobox.use-case';
import { FindEmpStatusPaginatedListUseCase } from '@features/201-files/application/use-cases/empstatus/find-empstatus-paginated-list.use-case';
import { SoftDeleteEmpStatusUseCase } from '@features/201-files/application/use-cases/empstatus/soft-delete-empstatus.use-case';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { EmpStatusRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/empstatus.repository';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [EmpStatusController],
  providers: [
    // Directly provide TransactionAdapter here
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.EMPSTATUS,
      useClass: EmpStatusRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    }, // Dependency Injection
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER,
      useClass: ErrorHandlerService,
    }, // Dependency Injection
    CreateEmpStatusUseCase,
    UpdateEmpStatusUseCase,
    SoftDeleteEmpStatusUseCase,
    FindEmpStatusPaginatedListUseCase,
    RetrieveEmpStatusForComboboxUseCase,
  ],
  exports: [
    CreateEmpStatusUseCase,
    UpdateEmpStatusUseCase,
    SoftDeleteEmpStatusUseCase,
    FindEmpStatusPaginatedListUseCase,
    RetrieveEmpStatusForComboboxUseCase,
  ],
})
export class EmpStatusModule {}
