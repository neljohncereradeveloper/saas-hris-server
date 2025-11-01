import { Module } from '@nestjs/common';
import { EduCourseLevelController } from './controller/edu-courselevel.controller';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { CreateEduCourseLevelUseCase } from '@features/201-files/application/use-cases/edu-courselevel/create-edu-courselevel.use-case';
import { UpdateEduCourseLevelUseCase } from '@features/201-files/application/use-cases/edu-courselevel/update-edu-courselevel.use-case';
import { RetrieveEduCourseLevelForComboboxUseCase } from '@features/201-files/application/use-cases/edu-courselevel/retrieve-edu-courselevel-for-combobox.use-case';
import { FindEduCourseLevelPaginatedListUseCase } from '@features/201-files/application/use-cases/edu-courselevel/find-edu-courselevel-paginated-list.use-case';
import { SoftDeleteEduCourseLevelUseCase } from '@features/201-files/application/use-cases/edu-courselevel/soft-delete-edu-courselevel.use-case';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { EduCourseLevelRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/edu-courselevel.repository';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [EduCourseLevelController],
  providers: [
    // Directly provide TransactionAdapter here
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.EDUCOURSELEVEL,
      useClass: EduCourseLevelRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    }, // Dependency Injection
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER,
      useClass: ErrorHandlerService,
    }, // Dependency Injection
    CreateEduCourseLevelUseCase,
    UpdateEduCourseLevelUseCase,
    SoftDeleteEduCourseLevelUseCase,
    FindEduCourseLevelPaginatedListUseCase,
    RetrieveEduCourseLevelForComboboxUseCase,
  ],
  exports: [
    CreateEduCourseLevelUseCase,
    UpdateEduCourseLevelUseCase,
    SoftDeleteEduCourseLevelUseCase,
    FindEduCourseLevelPaginatedListUseCase,
    RetrieveEduCourseLevelForComboboxUseCase,
  ],
})
export class EduCourseLevelModule {}
