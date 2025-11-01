import { Module } from '@nestjs/common';
import { LeaveTypeController } from './controller/leave-type.controller';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { CreateLeaveTypeUseCase } from '@features/leave-management/application/use-cases/leave-type/create-leave-type.use-case';
import { UpdateLeaveTypeUseCase } from '@features/leave-management/application/use-cases/leave-type/update-leave-type.use-case';
import { RetrieveLeaveTypeForComboboxUseCase } from '@features/leave-management/application/use-cases/leave-type/retrieve-leave-type-for-combobox.use-case';
import { FindLeaveTypePaginatedListUseCase } from '@features/leave-management/application/use-cases/leave-type/find-leave-type-paginated-list.use-case';
import { SoftDeleteLeaveTypeUseCase } from '@features/leave-management/application/use-cases/leave-type/soft-delete-leave-type.use-case';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { LeaveTypeRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/leave-type.repository';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [LeaveTypeController],
  providers: [
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
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
    CreateLeaveTypeUseCase,
    UpdateLeaveTypeUseCase,
    SoftDeleteLeaveTypeUseCase,
    FindLeaveTypePaginatedListUseCase,
    RetrieveLeaveTypeForComboboxUseCase,
  ],
  exports: [
    CreateLeaveTypeUseCase,
    UpdateLeaveTypeUseCase,
    SoftDeleteLeaveTypeUseCase,
    FindLeaveTypePaginatedListUseCase,
    RetrieveLeaveTypeForComboboxUseCase,
  ],
})
export class LeaveTypeModule {}

