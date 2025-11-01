import { Module } from '@nestjs/common';
import { TrainingCertController } from './controller/training-cert.controller';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { CreateTrainingCertUseCase } from '@features/201-files/application/use-cases/training-cert/create-trainingcert.use-case';
import { UpdateTrainingCertUseCase } from '@features/201-files/application/use-cases/training-cert/update-trainingcert.use-case';
import { RetrieveTrainingCertForComboboxUseCase } from '@features/201-files/application/use-cases/training-cert/retrieve-trainingcert-for-combobox.use-case';
import { FindTrainingCertPaginatedListUseCase } from '@features/201-files/application/use-cases/training-cert/find-trainingcert-paginated-list.use-case';
import { SoftDeleteTrainingCertUseCase } from '@features/201-files/application/use-cases/training-cert/soft-delete-trainingcert.use-case';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { TrainingCertRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/training-cert.repository';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [TrainingCertController],
  providers: [
    // Directly provide TransactionAdapter here
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRAININGCERT,
      useClass: TrainingCertRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    }, // Dependency Injection
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER,
      useClass: ErrorHandlerService,
    }, // Dependency Injection
    CreateTrainingCertUseCase,
    UpdateTrainingCertUseCase,
    SoftDeleteTrainingCertUseCase,
    FindTrainingCertPaginatedListUseCase,
    RetrieveTrainingCertForComboboxUseCase,
  ],
  exports: [
    CreateTrainingCertUseCase,
    UpdateTrainingCertUseCase,
    SoftDeleteTrainingCertUseCase,
    FindTrainingCertPaginatedListUseCase,
    RetrieveTrainingCertForComboboxUseCase,
  ],
})
export class TrainingCertModule {}
