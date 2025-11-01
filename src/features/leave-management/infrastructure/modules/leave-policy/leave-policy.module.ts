import { Module } from '@nestjs/common';
import { LeavePolicyController } from './controller/leave-policy.controller';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { CreateLeavePolicyUseCase } from '@features/leave-management/application/use-cases/leave-policy/create-leave-policy.use-case';
import { UpdateLeavePolicyUseCase } from '@features/leave-management/application/use-cases/leave-policy/update-leave-policy.use-case';
import { FindLeavePolicyPaginatedListUseCase } from '@features/leave-management/application/use-cases/leave-policy/find-leave-policy-paginated-list.use-case';
import { SoftDeleteLeavePolicyUseCase } from '@features/leave-management/application/use-cases/leave-policy/soft-delete-leave-policy.use-case';
import { ActivatePolicyUseCase } from '@features/leave-management/application/use-cases/leave-policy/activate-policy.use-case';
import { RetirePolicyUseCase } from '@features/leave-management/application/use-cases/leave-policy/retire-policy.use-case';
import { GetActivePolicyUseCase } from '@features/leave-management/application/use-cases/leave-policy/get-active-policy.use-case';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { LeavePolicyRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/leave-policy.repository';
import { LeaveTypeRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/leave-type.repository';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [LeavePolicyController],
  providers: [
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.LEAVE_POLICY,
      useClass: LeavePolicyRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.LEAVE_TYPE,
      useClass: LeaveTypeRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER,
      useClass: ErrorHandlerService,
    },
    CreateLeavePolicyUseCase,
    UpdateLeavePolicyUseCase,
    SoftDeleteLeavePolicyUseCase,
    FindLeavePolicyPaginatedListUseCase,
    ActivatePolicyUseCase,
    RetirePolicyUseCase,
    GetActivePolicyUseCase,
  ],
  exports: [
    CreateLeavePolicyUseCase,
    UpdateLeavePolicyUseCase,
    SoftDeleteLeavePolicyUseCase,
    FindLeavePolicyPaginatedListUseCase,
    ActivatePolicyUseCase,
    RetirePolicyUseCase,
    GetActivePolicyUseCase,
  ],
})
export class LeavePolicyModule {}
