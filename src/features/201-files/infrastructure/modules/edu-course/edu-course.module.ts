import { Module } from '@nestjs/common';
import { EduCourseController } from './controller/edu-course.controller';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { CreateEduCourseUseCase } from '@features/201-files/application/use-cases/edu-course/create-edu-course.use-case';
import { UpdateEduCourseUseCase } from '@features/201-files/application/use-cases/edu-course/update-edu-course.use-case';
import { RetrieveCourseForComboboxUseCase } from '@features/201-files/application/use-cases/edu-course/retrieve-edu-course-for-combobox.use-case';
import { FindEduCoursePaginatedListUseCase } from '@features/201-files/application/use-cases/edu-course/find-edu-course-paginated-list.use-case';
import { SoftDeleteEduCourseUseCase } from '@features/201-files/application/use-cases/edu-course/soft-delete-edu-course.use-case';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { EduCourseRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/edu-course.repository';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [EduCourseController],
  providers: [
    // Directly provide TransactionAdapter here
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.EDUCOURSE,
      useClass: EduCourseRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    }, // Dependency Injection
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER,
      useClass: ErrorHandlerService,
    }, // Dependency Injection
    CreateEduCourseUseCase,
    UpdateEduCourseUseCase,
    SoftDeleteEduCourseUseCase,
    FindEduCoursePaginatedListUseCase,
    RetrieveCourseForComboboxUseCase,
  ],
  exports: [
    CreateEduCourseUseCase,
    UpdateEduCourseUseCase,
    SoftDeleteEduCourseUseCase,
    FindEduCoursePaginatedListUseCase,
    RetrieveCourseForComboboxUseCase,
  ],
})
export class EduCourseModule {}
