import { Module } from '@nestjs/common';
import { BranchController } from './controller/branch.controller';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { CreateBranchUseCase } from '@features/201-files/application/use-cases/branch/create-branch.use-case';
import { UpdateBranchUseCase } from '@features/201-files/application/use-cases/branch/update-branch.use-case';
import { RetrieveBranchForComboboxUseCase } from '@features/201-files/application/use-cases/branch/retrieve-branch-for-combobox.use-case';
import { FindBranchPaginatedListUseCase } from '@features/201-files/application/use-cases/branch/find-branch-paginated-list.use-case';
import { SoftDeleteBranchUseCase } from '@features/201-files/application/use-cases/branch/soft-delete-branch.use-case';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { BranchRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/branch.repository';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [BranchController],
  providers: [
    // Directly provide TransactionAdapter here
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.BRANCH,
      useClass: BranchRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    }, // Dependency Injection
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER,
      useClass: ErrorHandlerService,
    }, // Dependency Injection
    CreateBranchUseCase,
    UpdateBranchUseCase,
    SoftDeleteBranchUseCase,
    FindBranchPaginatedListUseCase,
    RetrieveBranchForComboboxUseCase,
  ],
  exports: [
    CreateBranchUseCase,
    UpdateBranchUseCase,
    SoftDeleteBranchUseCase,
    FindBranchPaginatedListUseCase,
    RetrieveBranchForComboboxUseCase,
  ],
})
export class BranchModule {}
