import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { DocumentTypeRepository } from '@features/document-management/domain/repositories/document-type.repository';
import { CreateDocumentTypeCommand } from '../../commands/document-type/create-document-type.command';
import { DocumentType } from '@features/document-management/domain/models/document-type.model';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';

@Injectable()
export class CreateDocumentTypeUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.DOCUMENT_TYPE)
    private readonly documentTypeRepository: DocumentTypeRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    dto: CreateDocumentTypeCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<DocumentType> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CREATE_DOCUMENT_TYPE,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CREATE_DOCUMENT_TYPE,
          CONSTANTS_DATABASE_MODELS.DOCUMENT_TYPE,
          userId,
          dto,
          requestInfo,
          `Created new document type: ${dto.desc1}`,
          `Failed to create document type: ${dto.desc1}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Create the barangay
            const documentType = await this.documentTypeRepository.create(
              new DocumentType(dto),
              manager,
            );

            return documentType;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
