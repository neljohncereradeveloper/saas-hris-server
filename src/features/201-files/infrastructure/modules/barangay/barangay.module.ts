import { Module } from '@nestjs/common';
import { BarangayController } from './controller/barangay.controller';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { CreateBarangayUseCase } from '@features/201-files/application/use-cases/barangay/create-barangay.use-case';
import { UpdateBarangayUseCase } from '@features/201-files/application/use-cases/barangay/update-barangay.use-case';
import { RetrieveBarangayForComboboxUseCase } from '@features/201-files/application/use-cases/barangay/retrieve-barangay-for-combobox.use-case';
import { FindBarangayPaginatedListUseCase } from '@features/201-files/application/use-cases/barangay/find-barangay-paginated-list.use-case';
import { SoftDeleteBarangayUseCase } from '@features/201-files/application/use-cases/barangay/soft-delete-barangay.use-case';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { BarangayRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/barangay.repository';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [BarangayController],
  providers: [
    // Directly provide TransactionAdapter here
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.BARANGAY,
      useClass: BarangayRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER,
      useClass: ErrorHandlerService,
    }, // Dependency Injection
    CreateBarangayUseCase,
    UpdateBarangayUseCase,
    SoftDeleteBarangayUseCase,
    FindBarangayPaginatedListUseCase,
    RetrieveBarangayForComboboxUseCase,
  ],
  exports: [
    CreateBarangayUseCase,
    UpdateBarangayUseCase,
    SoftDeleteBarangayUseCase,
    FindBarangayPaginatedListUseCase,
    RetrieveBarangayForComboboxUseCase,
  ],
})
export class BarangayModule {}
