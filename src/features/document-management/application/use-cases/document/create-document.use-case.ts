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
import { UploadPort } from '@features/shared/ports/upload.port';
import { FilenameUtil } from '@features/shared/infrastructure/utils/filename.util';

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
    @Inject(CONSTANTS_REPOSITORY_TOKENS.UPLOAD_PORT)
    private readonly uploadPort: UploadPort,
  ) {}

  /**
   * Generate bucket name based on document type
   * @param documentType - The document type (e.g., "Contract", "ID Document")
   * @returns Sanitized bucket name
   */
  private generateBucketName(documentType: string): string {
    const sanitizedDocType = documentType
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    return `documents-${sanitizedDocType}`;
  }

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

            // Upload file if provided
            let filePath = dto.filePath;
            let fileName = dto.fileName;

            if (dto.fileBuffer && dto.fileMimetype && dto.fileName) {
              // Generate metadata-rich storage filename
              const storageFilename = FilenameUtil.generateStorageFilename({
                scope: dto.scope,
                employeeId: dto.employeeId,
                documentType: dto.documentType || 'document',
                originalFilename: dto.fileName,
              });

              // Prepare MinIO metadata
              const minioMetadata = {
                'x-amz-meta-original-filename': dto.fileName,
                'x-amz-meta-document-title': dto.title,
                'x-amz-meta-scope': dto.scope,
                'x-amz-meta-employee-id': dto.employeeId?.toString() || '',
                'x-amz-meta-document-type': dto.documentType || '',
                'x-amz-meta-uploaded-by': userId,
                'x-amz-meta-upload-timestamp': new Date().toISOString(),
              };

              // Prepare MinIO tags for better searchability
              const minioTags = {
                scope: dto.scope.toLowerCase(),
                documentType: (dto.documentType || 'document')
                  .toLowerCase()
                  .replace(/\s+/g, '-'),
                uploadedBy: userId,
                employeeId: dto.employeeId?.toString() || '',
                uploadDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
                fileExtension: FilenameUtil.extractExtension(dto.fileName),
              };

              // Generate bucket name based on document type
              const bucketName = this.generateBucketName(
                dto.documentType || 'document',
              );

              const uploadResult = await this.uploadPort.uploadFile(
                dto.fileBuffer,
                storageFilename,
                dto.fileMimetype,
                minioMetadata, // Pass metadata to MinIO
                minioTags, // Pass tags to MinIO
                bucketName, // Pass bucket name for document-type-specific storage
              );

              filePath = uploadResult.url;
              fileName = storageFilename;
            }

            // Create the document
            const document = await this.documentRepository.create(
              new Document({
                ...dto,
                fileName,
                filePath,
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
