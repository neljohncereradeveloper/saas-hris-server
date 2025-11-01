import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import {
  SomethinWentWrongException,
  NotFoundException,
} from '@features/shared/exceptions/shared';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { DocumentTypeRepository } from '@features/document-management/domain/repositories/document-type.repository';
import { UpdateDocumentTypeCommand } from '../../commands/document-type/update-document-type.command';
import { DocumentType } from '@features/document-management/domain/models/document-type.model';

@Injectable()
export class UpdateDocumentTypeUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.DOCUMENT_TYPE)
    private readonly documentTypeRepository: DocumentTypeRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    id: number,
    dto: UpdateDocumentTypeCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<DocumentType | null> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPDATE_DOCUMENT_TYPE,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPDATE_DOCUMENT_TYPE,
          CONSTANTS_DATABASE_MODELS.DOCUMENT_TYPE,
          userId,
          { id, dto },
          requestInfo,
          `Updated document type: ${dto.desc1}`,
          `Failed to update document type with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // validate document type existence
            const documentTypeResult =
              await this.documentTypeRepository.findById(id, manager);

            if (!documentTypeResult) {
              throw new NotFoundException('Document type not found');
            }

            // Update the document type
            const updateSuccessfull = await this.documentTypeRepository.update(
              id,
              new DocumentType(dto),
              manager,
            );
            if (!updateSuccessfull) {
              throw new SomethinWentWrongException(
                'Document type update failed',
              );
            }

            // Retrieve the updated document type
            const documentType = await this.documentTypeRepository.findById(
              id,
              manager,
            );

            return documentType!;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
