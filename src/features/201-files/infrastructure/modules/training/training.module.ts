import { Module } from '@nestjs/common';
import { TrainingController } from './controller/training.controller';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { CreateTrainingUseCase } from '@features/201-files/application/use-cases/training/create-training.use-case';
import { UpdateTrainingUseCase } from '@features/201-files/application/use-cases/training/update-training-experience.use-case';
import { FindEmployeesTrainingUseCase } from '@features/201-files/application/use-cases/training/find-employees-training.use-case';
import { SoftDeleteTrainingUseCase } from '@features/201-files/application/use-cases/training/soft-delete-training.use-case';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { TrainingRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/training.repository';
import { TrainingCertRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/training-cert.repository';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';
import { EmployeeRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/employee.repository';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [TrainingController],
  providers: [
    // Directly provide TransactionAdapter here
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRAINING,
      useClass: TrainingRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRAININGCERT,
      useClass: TrainingCertRepositoryImpl,
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
    CreateTrainingUseCase,
    UpdateTrainingUseCase,
    SoftDeleteTrainingUseCase,
    FindEmployeesTrainingUseCase,
  ],
  exports: [
    CreateTrainingUseCase,
    UpdateTrainingUseCase,
    SoftDeleteTrainingUseCase,
    FindEmployeesTrainingUseCase,
  ],
})
export class TrainingModule {}
