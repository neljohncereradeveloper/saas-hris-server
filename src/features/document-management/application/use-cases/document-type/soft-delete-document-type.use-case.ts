import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import {
  NotFoundException,
  SomethinWentWrongException,
} from '@features/shared/exceptions/shared';
import { DocumentTypeRepository } from '@features/document-management/domain/repositories/document-type.repository';

@Injectable()
export class SoftDeleteDocumentTypeUseCase {
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
    isActive: boolean,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<boolean> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.SOFT_DELETE_DOCUMENT_TYPE,
      async (manager) => {
        const action = isActive ? 'activate' : 'deactivate';
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.SOFT_DELETE_DOCUMENT_TYPE,
          CONSTANTS_DATABASE_MODELS.DOCUMENT_TYPE,
          userId,
          { id, isActive },
          requestInfo,
          `Document type has been ${action}d`,
          `Failed to ${action} document type with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Validate document type existence
            const documentType = await this.documentTypeRepository.findById(
              id,
              manager,
            );
            if (!documentType) {
              throw new NotFoundException('Document type not found');
            }

            // Soft delete the document type
            const softDeleteSuccessfull =
              await this.documentTypeRepository.softDelete(
                id,
                isActive,
                manager,
              );
            if (!softDeleteSuccessfull) {
              throw new SomethinWentWrongException(
                'Document type soft delete failed',
              );
            }

            return softDeleteSuccessfull;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
