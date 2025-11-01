import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { Module } from '@nestjs/common';
import { DocumentController } from './controller/document.controller';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { DocumentTypeRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/document-type.repository';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { DocumentRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/document.repository';
import { EmployeeRepositoryImpl } from '@features/201-files/infrastructure/database/typeorm/postgreSQL/repositories/employee.repository';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';
import { CreateDocumentUseCase } from '@features/document-management/application/use-cases/document/create-document.use-case';
import { UpdateDocumentUseCase } from '@features/document-management/application/use-cases/document/update-document.use-case';
import { SoftDeleteDocumentUseCase } from '@features/document-management/application/use-cases/document/soft-delete-document.use-case';
import { FindDocumentPaginatedListUseCase } from '@features/document-management/application/use-cases/document/find-document-paginated-list.use-case';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [DocumentController],
  providers: [
    // Directly provide TransactionAdapter here
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT,
      useClass: TransactionAdapter,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.DOCUMENT_TYPE,
      useClass: DocumentTypeRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.DOCUMENT,
      useClass: DocumentRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE,
      useClass: EmployeeRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER,
      useClass: ErrorHandlerService,
    }, // Dependency Injection
    CreateDocumentUseCase,
    UpdateDocumentUseCase,
    SoftDeleteDocumentUseCase,
    FindDocumentPaginatedListUseCase,
  ],
  exports: [
    CreateDocumentUseCase,
    UpdateDocumentUseCase,
    SoftDeleteDocumentUseCase,
    FindDocumentPaginatedListUseCase,
  ],
})
export class DocumentModule {}
