import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { Module } from '@nestjs/common';
import { EmployeeMovementTypeController } from './controller/employee-movement-type.controller';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';
import { EmployeeMovementTypeRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/employee-movement-type.repository';
import { CreateEmployeeMovementTypeUseCase } from '@features/201-files/application/use-cases/employee-movement-type/create-employee-movement-type.use-case';
import { UpdateEmployeeMovementTypeUseCase } from '@features/201-files/application/use-cases/employee-movement-type/update-employee-movement-type.use-case';
import { SoftDeleteEmployeeMovementTypeUseCase } from '@features/201-files/application/use-cases/employee-movement-type/soft-delete-employee-movement-type.use-case';
import { FindEmployeeMovementTypePaginatedListUseCase } from '@features/201-files/application/use-cases/employee-movement-type/find-employee-movement-type-paginated-list.use-case';
import { RetrieveEmployeeMovementTypeForComboboxUseCase } from '@features/201-files/application/use-cases/employee-movement-type/retrieve-employee-movement-type-for-combobox.use-case';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [EmployeeMovementTypeController],
  providers: [
    // Directly provide TransactionAdapter here
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE_MOVEMENT_TYPE,
      useClass: EmployeeMovementTypeRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    }, // Dependency Injection
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER,
      useClass: ErrorHandlerService,
    }, // Dependency Injection
    CreateEmployeeMovementTypeUseCase,
    UpdateEmployeeMovementTypeUseCase,
    SoftDeleteEmployeeMovementTypeUseCase,
    FindEmployeeMovementTypePaginatedListUseCase,
    RetrieveEmployeeMovementTypeForComboboxUseCase,
  ],
  exports: [
    CreateEmployeeMovementTypeUseCase,
    UpdateEmployeeMovementTypeUseCase,
    SoftDeleteEmployeeMovementTypeUseCase,
    FindEmployeeMovementTypePaginatedListUseCase,
    RetrieveEmployeeMovementTypeForComboboxUseCase,
  ],
})
export class EmployeeMovementTypeModule {}
