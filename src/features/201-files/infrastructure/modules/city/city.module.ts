import { Module } from '@nestjs/common';
import { CityController } from './controller/city.controller';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { CreateCityUseCase } from '@features/201-files/application/use-cases/city/create-city.use-case';
import { UpdateCityUseCase } from '@features/201-files/application/use-cases/city/update-city.use-case';
import { RetrieveCityForComboboxUseCase } from '@features/201-files/application/use-cases/city/retrieve-city-for-combobox.use-case';
import { FindCityPaginatedListUseCase } from '@features/201-files/application/use-cases/city/find-city-paginated-list.use-case';
import { SoftDeleteCityUseCase } from '@features/201-files/application/use-cases/city/soft-delete-city.use-case';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { CityRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/city.repository';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [CityController],
  providers: [
    // Directly provide TransactionAdapter here
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.CITY,
      useClass: CityRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    }, // Dependency Injection
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER,
      useClass: ErrorHandlerService,
    }, // Dependency Injection
    CreateCityUseCase,
    UpdateCityUseCase,
    SoftDeleteCityUseCase,
    FindCityPaginatedListUseCase,
    RetrieveCityForComboboxUseCase,
  ],
  exports: [
    CreateCityUseCase,
    UpdateCityUseCase,
    SoftDeleteCityUseCase,
    FindCityPaginatedListUseCase,
    RetrieveCityForComboboxUseCase,
  ],
})
export class CityModule {}
