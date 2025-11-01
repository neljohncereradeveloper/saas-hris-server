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
import { DocumentRepository } from '@features/document-management/domain/repositories/document.repository';
import { Document } from '@features/document-management/domain/models/document.model';
import { UpdateDocumentCommand } from '../../commands/document/update-document.command';
import { DocumentTypeRepository } from '@features/document-management/domain/repositories/document-type.repository';
import { EmployeeRepository } from '@features/shared/domain/repositories/employee.repository';

@Injectable()
export class UpdateDocumentUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.DOCUMENT)
    private readonly documentRepository: DocumentRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.DOCUMENT_TYPE)
    private readonly documentTypeRepository: DocumentTypeRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE)
    private readonly employeeRepository: EmployeeRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    id: number,
    dto: UpdateDocumentCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<Document | null> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPDATE_DOCUMENT,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPDATE_DOCUMENT,
          CONSTANTS_DATABASE_MODELS.DOCUMENT,
          userId,
          { id, dto },
          requestInfo,
          `Updated document: ${dto.title}`,
          `Failed to update document with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // validate document type existence
            const documentResult = await this.documentRepository.findById(
              id,
              manager,
            );
            if (!documentResult) {
              throw new NotFoundException('Document not found');
            }
            // validate document type existence
            const documentType = await this.documentTypeRepository.findByName(
              dto.documentType!,
              manager,
            );
            if (!documentType) {
              throw new NotFoundException('Document type not found');
            }
            // validate employee existence
            const employee = await this.employeeRepository.findById(
              dto.employeeId!,
              manager,
            );
            if (!employee) {
              throw new NotFoundException('Employee not found');
            }

            // Update the document type
            const updateSuccessfull = await this.documentRepository.update(
              id,
              new Document({
                ...dto,
                documentTypeId: documentType.id!,
                updatedBy: userId,
              }),
              manager,
            );
            if (!updateSuccessfull) {
              throw new SomethinWentWrongException('Document update failed');
            }

            // Retrieve the updated document type
            const document = await this.documentRepository.findById(
              id,
              manager,
            );

            return document!;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
