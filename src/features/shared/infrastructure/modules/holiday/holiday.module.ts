import { Module } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { CreateHolidayUseCase } from '@features/shared/application/use-cases/holiday/create-holiday.use-case';
import { UpdateHolidayUseCase } from '@features/shared/application/use-cases/holiday/update-holiday.use-case';
import { FindHolidayByIdUseCase } from '@features/shared/application/use-cases/holiday/find-holiday-by-id.use-case';
import { FindHolidaysByDateRangeUseCase } from '@features/shared/application/use-cases/holiday/find-holidays-by-date-range.use-case';
import { FindHolidayPaginatedListUseCase } from '@features/shared/application/use-cases/holiday/find-holiday-paginated-list.use-case';
import { FindHolidayByYearUseCase } from '@features/shared/application/use-cases/holiday/find-holiday-by-year.use-case';
import { SoftDeleteHolidayUseCase } from '@features/shared/application/use-cases/holiday/soft-delete-holiday.use-case';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { HolidayRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/holiday.repository';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';
import { HolidayService } from '@features/shared/application/services/holiday.service';
import { HolidayController } from './controller/holiday.controller';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [HolidayController],
  providers: [
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.HOLIDAY,
      useClass: HolidayRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER,
      useClass: ErrorHandlerService,
    },
    HolidayService,
    CreateHolidayUseCase,
    UpdateHolidayUseCase,
    FindHolidayByIdUseCase,
    FindHolidaysByDateRangeUseCase,
    FindHolidayPaginatedListUseCase,
    FindHolidayByYearUseCase,
    SoftDeleteHolidayUseCase,
  ],
  exports: [
    CONSTANTS_REPOSITORY_TOKENS.HOLIDAY,
    HolidayService,
    CreateHolidayUseCase,
    UpdateHolidayUseCase,
    FindHolidayByIdUseCase,
    FindHolidaysByDateRangeUseCase,
    FindHolidayPaginatedListUseCase,
    FindHolidayByYearUseCase,
    SoftDeleteHolidayUseCase,
  ],
})
export class HolidayModule {}

