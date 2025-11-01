import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { DocumentTypeRepository } from '@features/document-management/domain/repositories/document-type.repository';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { DocumentRepository } from '@features/document-management/domain/repositories/document.repository';
import { CreateDocumentCommand } from '../../commands/document/create-document.command';
import { Document } from '@features/document-management/domain/models/document.model';
import { NotFoundException } from '@features/shared/exceptions/shared';
import { EmployeeRepository } from '@features/shared/domain/repositories/employee.repository';

@Injectable()
export class CreateDocumentUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.DOCUMENT_TYPE)
    private readonly documentTypeRepository: DocumentTypeRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.DOCUMENT)
    private readonly documentRepository: DocumentRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE)
    private readonly employeeRepository: EmployeeRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    dto: CreateDocumentCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<Document> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CREATE_DOCUMENT,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CREATE_DOCUMENT,
          CONSTANTS_DATABASE_MODELS.DOCUMENT,
          userId,
          dto,
          requestInfo,
          `Created new document : ${dto.title}`,
          `Failed to create document : ${dto.title}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            const documentType = await this.documentTypeRepository.findByName(
              dto.documentType!,
              manager,
            );
            if (!documentType) {
              throw new NotFoundException('Document type not found');
            }
            // Only validate employee if employeeId is provided and scope is Employee
            let employee = null;
            if (dto.scope === 'Employee' && dto.employeeId) {
              employee = await this.employeeRepository.findById(
                dto.employeeId,
                manager,
              );
              if (!employee) {
                throw new NotFoundException('Employee not found');
              }
            }

            // Create the document
            const document = await this.documentRepository.create(
              new Document({
                ...dto,

                employeeId: employee?.id || dto.employeeId,
                documentTypeId: documentType.id!,
                uploadedBy: userId,
              }),
              manager,
            );

            return document;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
