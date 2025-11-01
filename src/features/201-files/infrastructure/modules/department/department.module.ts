import { Module } from '@nestjs/common';
import { DepartmentController } from './controller/department.controller';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { CreateDepartmentUseCase } from '@features/201-files/application/use-cases/department/create-department.use-case';
import { UpdateDepartmentUseCase } from '@features/201-files/application/use-cases/department/update-department.use-case';
import { RetrieveDepartmentForComboboxUseCase } from '@features/201-files/application/use-cases/department/retrieve-department-for-combobox.use-case';
import { FindDepartmentPaginatedListUseCase } from '@features/201-files/application/use-cases/department/find-department-paginated-list.use-case';
import { SoftDeleteDepartmentUseCase } from '@features/201-files/application/use-cases/department/soft-delete-department.use-case';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { DepartmentRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/department.repository';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [DepartmentController],
  providers: [
    // Directly provide TransactionAdapter here
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.DEPARTMENT,
      useClass: DepartmentRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    }, // Dependency Injection
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER,
      useClass: ErrorHandlerService,
    }, // Dependency Injection
    CreateDepartmentUseCase,
    UpdateDepartmentUseCase,
    SoftDeleteDepartmentUseCase,
    FindDepartmentPaginatedListUseCase,
    RetrieveDepartmentForComboboxUseCase,
  ],
  exports: [
    CreateDepartmentUseCase,
    UpdateDepartmentUseCase,
    SoftDeleteDepartmentUseCase,
    FindDepartmentPaginatedListUseCase,
    RetrieveDepartmentForComboboxUseCase,
  ],
})
export class DepartmentModule {}
