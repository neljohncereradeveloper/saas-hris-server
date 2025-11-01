import { Module } from '@nestjs/common';
import { ReferenceController } from './controller/reference.controller';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { CreateReferenceUseCase } from '@features/201-files/application/use-cases/reference/create-reference.use-case';
import { UpdateReferenceUseCase } from '@features/201-files/application/use-cases/reference/update-reference.use-case';
import { FindEmployeesReferenceUseCase } from '@features/201-files/application/use-cases/reference/find-employees-reference.use-case';
import { SoftDeleteReferenceUseCase } from '@features/201-files/application/use-cases/reference/soft-delete-reference.use-case';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { ReferenceRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/reference.repository';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';
import { EmployeeRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/employee.repository';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [ReferenceController],
  providers: [
    // Directly provide TransactionAdapter here
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.REFERENCE,
      useClass: ReferenceRepositoryImpl,
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
    CreateReferenceUseCase,
    UpdateReferenceUseCase,
    SoftDeleteReferenceUseCase,
    FindEmployeesReferenceUseCase,
  ],
  exports: [
    CreateReferenceUseCase,
    UpdateReferenceUseCase,
    SoftDeleteReferenceUseCase,
    FindEmployeesReferenceUseCase,
  ],
})
export class ReferenceModule {}
