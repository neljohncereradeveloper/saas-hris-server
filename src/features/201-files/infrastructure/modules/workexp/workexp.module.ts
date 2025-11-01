import { Module } from '@nestjs/common';
import { WorkExpController } from './controller/workexp.controller';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { CreateWorkExpUseCase } from '@features/201-files/application/use-cases/workexp/create-workexp.use-case';
import { UpdateWorkExpUseCase } from '@features/201-files/application/use-cases/workexp/update-workexp.use-case';
import { FindEmployeesWorkExpUseCase } from '@features/201-files/application/use-cases/workexp/find-employees-workexp.use-case';
import { SoftDeleteWorkExpUseCase } from '@features/201-files/application/use-cases/workexp/soft-delete-workexp.use-case';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { WorkExpRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/workexp.repository';
import { WorkexpCompanyRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/workexp-company.repository';
import { WorkExpJobTitleRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/workexp-jobtitle.repository';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';
import { EmployeeRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/employee.repository';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [WorkExpController],
  providers: [
    // Directly provide TransactionAdapter here
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.WORKEXP,
      useClass: WorkExpRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.WORKEXPCOMPANY,
      useClass: WorkexpCompanyRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.WORKEXPJOBTITLE,
      useClass: WorkExpJobTitleRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE,
      useClass: EmployeeRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    }, // Dependency Injection
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER,
      useClass: ErrorHandlerService,
    }, // Dependency Injection
    CreateWorkExpUseCase,
    UpdateWorkExpUseCase,
    SoftDeleteWorkExpUseCase,
    FindEmployeesWorkExpUseCase,
  ],
  exports: [
    CreateWorkExpUseCase,
    UpdateWorkExpUseCase,
    SoftDeleteWorkExpUseCase,
    FindEmployeesWorkExpUseCase,
  ],
})
export class WorkExpModule {}
