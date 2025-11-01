import { Module } from '@nestjs/common';
import { ProvinceController } from './controller/province.controller';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { CreateProvinceUseCase } from '@features/201-files/application/use-cases/province/create-province.use-case';
import { UpdateProvinceUseCase } from '@features/201-files/application/use-cases/province/update-province.use-case';
import { RetrieveProvinceForComboboxUseCase } from '@features/201-files/application/use-cases/province/retrieve-province-for-combobox.use-case';
import { FindProvincePaginatedListUseCase } from '@features/201-files/application/use-cases/province/find-province-paginated-list.use-case';
import { SoftDeleteProvinceUseCase } from '@features/201-files/application/use-cases/province/soft-delete-province.use-case';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { ProvinceRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/province.repository';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [ProvinceController],
  providers: [
    // Directly provide TransactionAdapter here
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.PROVINCE,
      useClass: ProvinceRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    }, // Dependency Injection
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER,
      useClass: ErrorHandlerService,
    }, // Dependency Injection
    CreateProvinceUseCase,
    UpdateProvinceUseCase,
    SoftDeleteProvinceUseCase,
    FindProvincePaginatedListUseCase,
    RetrieveProvinceForComboboxUseCase,
  ],
  exports: [
    CreateProvinceUseCase,
    UpdateProvinceUseCase,
    SoftDeleteProvinceUseCase,
    FindProvincePaginatedListUseCase,
    RetrieveProvinceForComboboxUseCase,
  ],
})
export class ProvinceModule {}
