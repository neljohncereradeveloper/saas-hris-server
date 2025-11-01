import { Module } from '@nestjs/common';
import { EmployeeMovementController } from './controller/employee-movement.controller';
import { CreateEmployeeMovementUseCase } from '@features/201-files/application/use-cases/employee-movement/create-employee-movement.use-case';
import { UpdateEmployeeMovementUseCase } from '@features/201-files/application/use-cases/employee-movement/update-employee-movement.use-case';
import { FindEmployeeMovementsByEmployeeUseCase } from '@features/201-files/application/use-cases/employee-movement/find-employee-movements-by-employee.use-case';
import { FindWithPaginatedListEmployeeMovementUseCase } from '@features/201-files/application/use-cases/employee-movement/find-with-paginated-list-employee-movement.use-case';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { EmployeeRepositoryImpl } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/repositories/employee.repository';
import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { EmployeeMovementRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/employee-movement.repository';
import { BranchRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/branch.repository';
import { DepartmentRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/department.repository';
import { JobTitleRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/jobtitle.repository';
import { SoftDeleteEmployeeMovementUseCase } from '../../../application/use-cases/employee-movement/soft-delete-employee-movement.use-case';
import { EmployeeMovementTypeRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/employee-movement-type.repository';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [EmployeeMovementController],
  providers: [
    // Repositories
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE_MOVEMENT,
      useClass: EmployeeMovementRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE,
      useClass: EmployeeRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.BRANCH,
      useClass: BranchRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.DEPARTMENT,
      useClass: DepartmentRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.JOBTITLE,
      useClass: JobTitleRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE_MOVEMENT_TYPE,
      useClass: EmployeeMovementTypeRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER,
      useClass: ErrorHandlerService,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    },
    // Use Cases
    CreateEmployeeMovementUseCase,
    UpdateEmployeeMovementUseCase,
    FindEmployeeMovementsByEmployeeUseCase,
    FindWithPaginatedListEmployeeMovementUseCase,
    SoftDeleteEmployeeMovementUseCase,
  ],
  exports: [
    CreateEmployeeMovementUseCase,
    UpdateEmployeeMovementUseCase,
    FindEmployeeMovementsByEmployeeUseCase,
    FindWithPaginatedListEmployeeMovementUseCase,
    SoftDeleteEmployeeMovementUseCase,
  ],
})
export class EmployeeMovementModule {}
