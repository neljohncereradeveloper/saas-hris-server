import { Module } from '@nestjs/common';
import { EduController } from './controller/edu.controller';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { CreateEduUseCase } from '@features/201-files/application/use-cases/edu/create-edu.use-case';
import { UpdateEduUseCase } from '@features/201-files/application/use-cases/edu/update-edu.use-case';
import { FindEmployeesEduUseCase } from '@features/201-files/application/use-cases/edu/find-employees-edu.use-case';
import { SoftDeleteEduUseCase } from '@features/201-files/application/use-cases/edu/soft-delete-edu.use-case';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { EduRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/edu.repository';
import { EduLevelRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/edu-level.repository';
import { EduSchoolRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/edu-school.repository';
import { EduCourseRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/edu-course.repository';
import { EduCourseLevelRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/edu-courselevel.repository';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [EduController],
  providers: [
    // Directly provide TransactionAdapter here
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.EDU,
      useClass: EduRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.EDUSCHOOL,
      useClass: EduSchoolRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.EDULEVEL,
      useClass: EduLevelRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.EDUCOURSE,
      useClass: EduCourseRepositoryImpl,
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
    CreateEduUseCase,
    UpdateEduUseCase,
    SoftDeleteEduUseCase,
    FindEmployeesEduUseCase,
  ],
  exports: [
    CreateEduUseCase,
    UpdateEduUseCase,
    SoftDeleteEduUseCase,
    FindEmployeesEduUseCase,
  ],
})
export class EduModule {}
