import { Module } from '@nestjs/common';
import { LeaveRequestController } from './controller/leave-request.controller';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { CreateLeaveRequestUseCase } from '@features/leave-management/application/use-cases/leave-request/create-leave-request.use-case';
import { UpdateLeaveRequestUseCase } from '@features/leave-management/application/use-cases/leave-request/update-leave-request.use-case';
import { ApproveLeaveRequestUseCase } from '@features/leave-management/application/use-cases/leave-request/approve-leave-request.use-case';
import { RejectLeaveRequestUseCase } from '@features/leave-management/application/use-cases/leave-request/reject-leave-request.use-case';
import { CancelLeaveRequestUseCase } from '@features/leave-management/application/use-cases/leave-request/cancel-leave-request.use-case';
import { FindLeaveRequestByIdUseCase } from '@features/leave-management/application/use-cases/leave-request/find-leave-request-by-id.use-case';
import { FindLeaveRequestsByEmployeeUseCase } from '@features/leave-management/application/use-cases/leave-request/find-leave-requests-by-employee.use-case';
import { FindPendingLeaveRequestsUseCase } from '@features/leave-management/application/use-cases/leave-request/find-pending-leave-requests.use-case';
import { FindLeaveRequestPaginatedListUseCase } from '@features/leave-management/application/use-cases/leave-request/find-leave-request-paginated-list.use-case';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { LeaveRequestRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/leave-request.repository';
import { LeaveBalanceRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/leave-balance.repository';
import { LeaveTypeRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/leave-type.repository';
import { LeaveTransactionRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/leave-transaction.repository';
import { EmployeeRepositoryImpl } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/repositories/employee.repository';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';
import { HolidayRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/holiday.repository';
import { LeavePolicyRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/leave-policy.repository';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [LeaveRequestController],
  providers: [
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.LEAVE_REQUEST,
      useClass: LeaveRequestRepositoryImpl,
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
      provide: CONSTANTS_REPOSITORY_TOKENS.LEAVE_TRANSACTION,
      useClass: LeaveTransactionRepositoryImpl,
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
      provide: CONSTANTS_REPOSITORY_TOKENS.HOLIDAY,
      useClass: HolidayRepositoryImpl,
    },
    CreateLeaveRequestUseCase,
    UpdateLeaveRequestUseCase,
    ApproveLeaveRequestUseCase,
    RejectLeaveRequestUseCase,
    CancelLeaveRequestUseCase,
    FindLeaveRequestByIdUseCase,
    FindLeaveRequestsByEmployeeUseCase,
    FindPendingLeaveRequestsUseCase,
    FindLeaveRequestPaginatedListUseCase,
  ],
  exports: [
    CreateLeaveRequestUseCase,
    UpdateLeaveRequestUseCase,
    ApproveLeaveRequestUseCase,
    RejectLeaveRequestUseCase,
    CancelLeaveRequestUseCase,
    FindLeaveRequestByIdUseCase,
    FindLeaveRequestsByEmployeeUseCase,
    FindPendingLeaveRequestsUseCase,
    FindLeaveRequestPaginatedListUseCase,
  ],
})
export class LeaveRequestModule {}
