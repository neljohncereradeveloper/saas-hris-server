import { Module } from '@nestjs/common';
import { LeaveYearConfigurationController } from './controller/leave-year-configuration.controller';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { CreateLeaveYearConfigurationUseCase } from '@features/leave-management/application/use-cases/leave-year-configuration/create-leave-year-configuration.use-case';
import { UpdateLeaveYearConfigurationUseCase } from '@features/leave-management/application/use-cases/leave-year-configuration/update-leave-year-configuration.use-case';
import { FindLeaveYearConfigurationByYearUseCase } from '@features/leave-management/application/use-cases/leave-year-configuration/find-leave-year-configuration-by-year.use-case';
import { GetActiveCutoffForDateUseCase } from '@features/leave-management/application/use-cases/leave-year-configuration/get-active-cutoff-for-date.use-case';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { LeaveYearConfigurationRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/leave-year-configuration.repository';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [LeaveYearConfigurationController],
  providers: [
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.LEAVE_YEAR_CONFIGURATION,
      useClass: LeaveYearConfigurationRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER,
      useClass: ErrorHandlerService,
    },
    CreateLeaveYearConfigurationUseCase,
    UpdateLeaveYearConfigurationUseCase,
    FindLeaveYearConfigurationByYearUseCase,
    GetActiveCutoffForDateUseCase,
  ],
  exports: [
    CreateLeaveYearConfigurationUseCase,
    UpdateLeaveYearConfigurationUseCase,
    FindLeaveYearConfigurationByYearUseCase,
    GetActiveCutoffForDateUseCase,
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.LEAVE_YEAR_CONFIGURATION,
      useClass: LeaveYearConfigurationRepositoryImpl,
    },
  ],
})
export class LeaveYearConfigurationModule {}

