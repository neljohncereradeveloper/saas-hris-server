import { Module } from '@nestjs/common';
import { LeaveCycleController } from './controller/leave-cycle.controller';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { CreateLeaveCycleUseCase } from '@features/leave-management/application/use-cases/leave-cycle/create-leave-cycle.use-case';
import { SetupLeaveCyclesUseCase } from '@features/leave-management/application/use-cases/leave-cycle/setup-leave-cycles.use-case';
import { FindCyclesByEmployeeUseCase } from '@features/leave-management/application/use-cases/leave-cycle/find-cycles-by-employee.use-case';
import { GetActiveCycleUseCase } from '@features/leave-management/application/use-cases/leave-cycle/get-active-cycle.use-case';
import { CloseCycleUseCase } from '@features/leave-management/application/use-cases/leave-cycle/close-cycle.use-case';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { LeaveCycleRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/leave-cycle.repository';
import { LeaveTypeRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/leave-type.repository';
import { EmployeeRepositoryImpl } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/repositories/employee.repository';
import { LeavePolicyRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/leave-policy.repository';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [LeaveCycleController],
  providers: [
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.LEAVE_CYCLE,
      useClass: LeaveCycleRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.LEAVE_TYPE,
      useClass: LeaveTypeRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.LEAVE_POLICY,
      useClass: LeavePolicyRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE,
      useClass: EmployeeRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER,
      useClass: ErrorHandlerService,
    },
    CreateLeaveCycleUseCase,
    SetupLeaveCyclesUseCase,
    FindCyclesByEmployeeUseCase,
    GetActiveCycleUseCase,
    CloseCycleUseCase,
  ],
  exports: [
    CreateLeaveCycleUseCase,
    SetupLeaveCyclesUseCase,
    FindCyclesByEmployeeUseCase,
    GetActiveCycleUseCase,
    CloseCycleUseCase,
  ],
})
export class LeaveCycleModule {}

