import { Module } from '@nestjs/common';
import { LeaveBalanceController } from './controller/leave-balance.controller';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { CreateLeaveBalanceUseCase } from '@features/leave-management/application/use-cases/leave-balance/create-leave-balance.use-case';
import { GenerateAnnualLeaveBalancesUseCase } from '@features/leave-management/application/use-cases/leave-balance/generate-annual-leave-balances.use-case';
import { FindLeaveBalanceByEmployeeYearUseCase } from '@features/leave-management/application/use-cases/leave-balance/find-leave-balance-by-employee-year.use-case';
import { CloseLeaveBalanceUseCase } from '@features/leave-management/application/use-cases/leave-balance/close-leave-balance.use-case';
import { SoftDeleteLeaveBalanceUseCase } from '@features/leave-management/application/use-cases/leave-balance/soft-delete-leave-balance.use-case';
import { ResetLeaveBalancesForYearUseCase } from '@features/leave-management/application/use-cases/leave-balance/reset-leave-balances-for-year.use-case';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { LeaveBalanceRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/leave-balance.repository';
import { LeaveTypeRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/leave-type.repository';
import { LeavePolicyRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/leave-policy.repository';
import { LeaveYearConfigurationRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/leave-year-configuration.repository';
import { EmployeeRepositoryImpl } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/repositories/employee.repository';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [LeaveBalanceController],
  providers: [
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.LEAVE_BALANCE,
      useClass: LeaveBalanceRepositoryImpl,
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
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.LEAVE_YEAR_CONFIGURATION,
      useClass: LeaveYearConfigurationRepositoryImpl,
    },
    CreateLeaveBalanceUseCase,
    GenerateAnnualLeaveBalancesUseCase,
    FindLeaveBalanceByEmployeeYearUseCase,
    CloseLeaveBalanceUseCase,
    SoftDeleteLeaveBalanceUseCase,
    ResetLeaveBalancesForYearUseCase,
  ],
  exports: [
    CreateLeaveBalanceUseCase,
    GenerateAnnualLeaveBalancesUseCase,
    FindLeaveBalanceByEmployeeYearUseCase,
    CloseLeaveBalanceUseCase,
    SoftDeleteLeaveBalanceUseCase,
    ResetLeaveBalancesForYearUseCase,
  ],
})
export class LeaveBalanceModule {}
