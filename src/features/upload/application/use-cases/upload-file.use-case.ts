import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { UploadPort } from '@features/shared/ports/upload.port';
import { UploadFileCommand } from '../commands/upload-file.command';

@Injectable()
export class UploadFileUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.UPLOAD_PORT)
    private readonly uploadPort: UploadPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    dto: UploadFileCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<{
    url: string;
    filename: string;
    mimetype: string;
    size: number;
    fileType: string;
    expiresIn: string;
    previewUrl?: string;
    contractUrl?: string;
    documentUrl?: string;
    securityNote?: string;
  }> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPLOAD_FILE,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPLOAD_FILE,
          CONSTANTS_DATABASE_MODELS.UPLOAD,
          userId,
          dto,
          requestInfo,
          `Uploaded file: ${dto.filename}`,
          `Failed to upload file: ${dto.filename}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Upload the file
            const result = await this.uploadPort.uploadFile(
              dto.buffer,
              dto.filename,
              dto.mimetype,
            );

            // Generate URL based on file type
            let url: string;
            let expiresIn: string;
            let previewUrl: string | undefined;
            let contractUrl: string | undefined;
            let documentUrl: string | undefined;
            let securityNote: string | undefined;

            switch (dto.fileType) {
              case 'image':
                expiresIn = '7 days';
                previewUrl = await this.uploadPort.getPreviewUrl(dto.filename);
                break;
              case 'contract':
                expiresIn = '1 hour';
                contractUrl = await this.uploadPort.getContractUrl(
                  dto.filename,
                );
                securityNote = 'This URL expires in 1 hour for security';
                break;
              case 'public-document':
                expiresIn = '30 days';
                documentUrl = await this.uploadPort.getPublicDocumentUrl(
                  dto.filename,
                );
                break;
              case 'temporary':
                expiresIn = '15 minutes';
                url = await this.uploadPort.getUrlByFileType(
                  dto.filename,
                  dto.fileType,
                );
                break;
              default:
                expiresIn = '7 days';
                previewUrl = await this.uploadPort.getPreviewUrl(dto.filename);
            }

            return {
              ...result,
              filename: dto.filename,
              mimetype: dto.mimetype,
              size: dto.buffer.length,
              fileType: dto.fileType,
              expiresIn,
              previewUrl,
              contractUrl,
              documentUrl,
              securityNote,
            };
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
