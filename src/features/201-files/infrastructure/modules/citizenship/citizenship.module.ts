import { Module } from '@nestjs/common';
import { CitizenshipController } from './controller/citizenship.controller';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { CreateCitizenshipUseCase } from '@features/201-files/application/use-cases/citizenship/create-citizenship.use-case';
import { UpdateCitizenshipUseCase } from '@features/201-files/application/use-cases/citizenship/update-citizenship.use-case';
import { RetrieveCitizenshipForComboboxUseCase } from '@features/201-files/application/use-cases/citizenship/retrieve-citizenship-for-combobox.use-case';
import { FindCitizenshipPaginatedListUseCase } from '@features/201-files/application/use-cases/citizenship/find-citizenship-paginated-list.use-case';
import { SoftDeleteCitizenshipUseCase } from '@features/201-files/application/use-cases/citizenship/soft-delete-citizenship.use-case';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { CitizenShipRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/citizenship.repository';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [CitizenshipController],
  providers: [
    // Directly provide TransactionAdapter here
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.CITIZENSHIP,
      useClass: CitizenShipRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    }, // Dependency Injection
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER,
      useClass: ErrorHandlerService,
    }, // Dependency Injection
    CreateCitizenshipUseCase,
    UpdateCitizenshipUseCase,
    SoftDeleteCitizenshipUseCase,
    FindCitizenshipPaginatedListUseCase,
    RetrieveCitizenshipForComboboxUseCase,
  ],
  exports: [
    CreateCitizenshipUseCase,
    UpdateCitizenshipUseCase,
    SoftDeleteCitizenshipUseCase,
    FindCitizenshipPaginatedListUseCase,
    RetrieveCitizenshipForComboboxUseCase,
  ],
})
export class CitizenshipModule {}
