import { Module } from '@nestjs/common';
import { CivilStatusController } from './controller/civil-status.controller';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { CreateCivilStatusUseCase } from '@features/201-files/application/use-cases/civilstatus/create-civil-status.use-case';
import { UpdateCivilStatusUseCase } from '@features/201-files/application/use-cases/civilstatus/update-civil-status.use-case';
import { RetrieveCivilStatusForComboboxUseCase } from '@features/201-files/application/use-cases/civilstatus/retrieve-civil-status-for-combobox.use-case';
import { FindCivilStatusPaginatedListUseCase } from '@features/201-files/application/use-cases/civilstatus/find-civil-status-paginated-list.use-case';
import { SoftDeleteCivilStatusUseCase } from '@features/201-files/application/use-cases/civilstatus/soft-delete-civil-status.use-case';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { CivilStatusRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/civilstatus.repository';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [CivilStatusController],
  providers: [
    // Directly provide TransactionAdapter here
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.CIVILSTATUS,
      useClass: CivilStatusRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    }, // Dependency Injection
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER,
      useClass: ErrorHandlerService,
    }, // Dependency Injection
    CreateCivilStatusUseCase,
    UpdateCivilStatusUseCase,
    SoftDeleteCivilStatusUseCase,
    FindCivilStatusPaginatedListUseCase,
    RetrieveCivilStatusForComboboxUseCase,
  ],
  exports: [
    CreateCivilStatusUseCase,
    UpdateCivilStatusUseCase,
    SoftDeleteCivilStatusUseCase,
    FindCivilStatusPaginatedListUseCase,
    RetrieveCivilStatusForComboboxUseCase,
  ],
})
export class CivilStatusModule {}
