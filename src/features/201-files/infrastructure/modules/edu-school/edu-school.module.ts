import { Module } from '@nestjs/common';
import { EduSchoolController } from './controller/edu-school.controller';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { CreateEduSchoolUseCase } from '@features/201-files/application/use-cases/edu-school/create-edu-school.use-case';
import { UpdateEduSchoolUseCase } from '@features/201-files/application/use-cases/edu-school/update-edu-school.use-case';
import { RetrieveEduSchoolForComboboxUseCase } from '@features/201-files/application/use-cases/edu-school/retrieve-edu-school-for-combobox.use-case';
import { FindEduSchoolPaginatedListUseCase } from '@features/201-files/application/use-cases/edu-school/find-edu-school-paginated-list.use-case';
import { SoftDeleteEduSchoolUseCase } from '@features/201-files/application/use-cases/edu-school/soft-delete-edu-school.use-case';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { EduSchoolRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/edu-school.repository';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [EduSchoolController],
  providers: [
    // Directly provide TransactionAdapter here
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.EDUSCHOOL,
      useClass: EduSchoolRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    }, // Dependency Injection
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER,
      useClass: ErrorHandlerService,
    }, // Dependency Injection
    CreateEduSchoolUseCase,
    UpdateEduSchoolUseCase,
    SoftDeleteEduSchoolUseCase,
    FindEduSchoolPaginatedListUseCase,
    RetrieveEduSchoolForComboboxUseCase,
  ],
  exports: [
    CreateEduSchoolUseCase,
    UpdateEduSchoolUseCase,
    SoftDeleteEduSchoolUseCase,
    FindEduSchoolPaginatedListUseCase,
    RetrieveEduSchoolForComboboxUseCase,
  ],
})
export class EduSchoolModule {}
