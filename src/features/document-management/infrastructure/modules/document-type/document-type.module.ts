import { PostgresqlDatabaseModule } from '@features/shared/infrastructure/database/typeorm/postgresql/postgresql-database.module';
import { Module } from '@nestjs/common';
import { DocumentTypeController } from './controller/document-type.controller';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionAdapter } from '@features/shared/infrastructure/database/typeorm/postgresql/adapters/transaction-helper.adapter';
import { DocumentTypeRepositoryImpl } from '../../database/typeorm/postgreSQL/repositories/document-type.repository';
import { ActivityLogRepositoryImpl } from '@features/shared/infrastructure/database/typeorm/postgresql/repositories/activity-log.repository.impl';
import { ErrorHandlerService } from '@features/shared/infrastructure/services/error-handler.service';
import { CreateDocumentTypeUseCase } from '@features/document-management/application/use-cases/document-type/create-document-type.use-case';
import { UpdateDocumentTypeUseCase } from '@features/document-management/application/use-cases/document-type/update-document-type.use-case';
import { SoftDeleteDocumentTypeUseCase } from '@features/document-management/application/use-cases/document-type/soft-delete-document-type.use-case';
import { FindDocumentTypePaginatedListUseCase } from '@features/document-management/application/use-cases/document-type/find-document-type-paginated-list.use-case';
import { RetrieveDocumentTypeForComboboxUseCase } from '@features/document-management/application/use-cases/document-type/retrieve-document-type-for-combobox.use-case';

@Module({
  imports: [PostgresqlDatabaseModule],
  controllers: [DocumentTypeController],
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
      provide: CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS,
      useClass: ActivityLogRepositoryImpl,
    },
    {
      provide: CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER,
      useClass: ErrorHandlerService,
    }, // Dependency Injection
    CreateDocumentTypeUseCase,
    UpdateDocumentTypeUseCase,
    SoftDeleteDocumentTypeUseCase,
    FindDocumentTypePaginatedListUseCase,
    RetrieveDocumentTypeForComboboxUseCase,
  ],
  exports: [
    CreateDocumentTypeUseCase,
    UpdateDocumentTypeUseCase,
    SoftDeleteDocumentTypeUseCase,
    FindDocumentTypePaginatedListUseCase,
    RetrieveDocumentTypeForComboboxUseCase,
  ],
})
export class DocumentTypeModule {}
