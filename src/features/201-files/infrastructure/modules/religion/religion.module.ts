import { Module } from '@nestjs/common';
import { ReligionController } from './controller/religion.controller';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { CreateReligionUseCase } from '@features/201-files/application/use-cases/religion/create-religion.use-case';
import { UpdateReligionUseCase } from '@features/201-files/application/use-cases/religion/update-religion.use-case';
import { RetrieveReligionForComboboxUseCase } from '@features/201-files/application/use-cases/religion/retrieve-religion-for-combobox.use-case';
import { FindReligionPaginatedListUseCase } from '@features/201-files/application/use-cases/religion/find-religion-paginated-list.use-case';
import { SoftDeleteReligionUseCase } from '@features/201-files/application/use-cases/religion/soft-delete-religion.use-case';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { ReligionRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/religion.repository';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [ReligionController],
  providers: [
    // Directly provide TransactionAdapter here
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.RELIGION,
      useClass: ReligionRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    }, // Dependency Injection
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER,
      useClass: ErrorHandlerService,
    }, // Dependency Injection
    CreateReligionUseCase,
    UpdateReligionUseCase,
    SoftDeleteReligionUseCase,
    FindReligionPaginatedListUseCase,
    RetrieveReligionForComboboxUseCase,
  ],
  exports: [
    CreateReligionUseCase,
    UpdateReligionUseCase,
    SoftDeleteReligionUseCase,
    FindReligionPaginatedListUseCase,
    RetrieveReligionForComboboxUseCase,
  ],
})
export class ReligionModule {}
